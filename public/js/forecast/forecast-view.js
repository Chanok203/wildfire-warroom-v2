// element
const initForecastId = window.initForecastId;
const qgisUrl = window.initQgisUrl;

const refTimeInput = document.getElementById('ref_time');
const pastMinsInput = document.getElementById('past_mins');
const futureMinsInput = document.getElementById('future_mins');
const submitBtn = document.getElementById('submitBtn');
const filterForm = document.getElementById('filter-form');
const minTimeSpan = document.getElementById('minTime');
const maxTimeSpan = document.getElementById('maxTime');

const formatToLocalISO = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toLocalDate = (isoStr) => {
    const tzOffset = new Date().getTimezoneOffset() * 60000; // -420 * 60000
    return new Date(new Date(isoStr).getTime() - tzOffset);
};

// init value
let fireGeoJSON = null;
const now = new Date();
refTimeInput.value = formatToLocalISO(now);
pastMinsInput.value = 30;
futureMinsInput.value = 60;

const defaultCenter = [100.213579, 18.684905]; // [lng, lat]
const defaultZoom = 14;

// สร้างตัวแปร map ไว้ที่ global scope (นอกฟังก์ชัน) เพื่อให้ปุ่มยืนยันเรียกใช้ได้
let map = new maplibregl.Map({
    container: 'map', // ต้องตรงกับ id="map" ใน HTML
    style: {
        version: 8,
        sources: {
            'base-tiles': {
                type: 'raster',
                tiles: [
                    `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=map&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=TRUE`,
                ],
                tileSize: 256,
                attribution: '&copy; Mae Yom National Park',
            },
        },
        layers: [
            {
                id: 'base-layer',
                type: 'raster',
                source: 'base-tiles',
                minzoom: 0,
                maxzoom: 18,
            },
        ],
    },
    center: defaultCenter,
    zoom: defaultZoom,
});

function applyFireFilter(shouldFetch = false) {
    const refDate = new Date(refTimeInput.value);
    const past = parseInt(pastMinsInput.value) || 0;
    const future = parseInt(futureMinsInput.value) || 0;

    const startTime = new Date(refDate.getTime() - past * 60000).toISOString();
    const endTime = new Date(refDate.getTime() + future * 60000).toISOString();

    const source = map.getSource('fire-source');
    const freshWfsUrl = `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=fire_forecast&OUTPUTFORMAT=application/json`;

    // ถ้าสั่งให้ Fetch ใหม่ (เช่น ตอนกดปุ่ม)
    if (shouldFetch && source) {
        fetch(freshWfsUrl)
            .then((r) => r.json())
            .then((geojson) => {
                fireGeoJSON = addUnixTime(geojson);
                source.setData(fireGeoJSON);
                map.once('data', (e) => {
                    if (
                        e.sourceId === 'fire-source' &&
                        map.isSourceLoaded('fire-source')
                    ) {
                        executeFilter(startTime, endTime);
                    }
                });
            });
    } else {
        // ถ้าเป็นการกรองปกติ (เช่น ตอนโหลดหน้าเว็บครั้งแรก)
        executeFilter(startTime, endTime);
    }
}

function executeFilter(start, end) {
    // 1. กรองข้อมูล (ใช้ start/end ที่รวม past/future แล้ว)
    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();
    const startClean = startISO.slice(0, 16);
    const endClean = endISO.slice(0, 16);

    if (fireGeoJSON && fireGeoJSON.features) {
        const times = fireGeoJSON.features
            .map((f) => f.properties.target_time)
            .filter(Boolean)
            .sort();
        const filteredTimes = times.filter(
            (t) => t.slice(0, 16) >= startClean && t.slice(0, 16) <= endClean,
        );
        console.log('=== Filter Applied ===');
        console.log('Filter range:', startClean, '→', endClean);

        console.log('Total features:', filteredTimes.length);

        if (filteredTimes.length > 0) {
            console.log('Data min:', filteredTimes[0]);
            console.log('Data max:', filteredTimes[filteredTimes.length - 1]);

            minTimeSpan.innerHTML = toLocalDate(
                new Date(filteredTimes[0]),
            ).toLocaleString('th-TH', {
                dateStyle: 'long',
                timeStyle: 'medium',
            });
            maxTimeSpan.innerHTML = toLocalDate(
                new Date(filteredTimes[filteredTimes.length - 1]),
            ).toLocaleString('th-TH', {
                dateStyle: 'long',
                timeStyle: 'medium',
            });
        } else {
            minTimeSpan.innerHTML = "-"
            maxTimeSpan.innerHTML = "-"
        }
    }

    const filter = [
        'all',
        [
            '>=',
            ['slice', ['to-string', ['get', 'target_time']], 0, 16],
            startClean,
        ],
        [
            '<=',
            ['slice', ['to-string', ['get', 'target_time']], 0, 16],
            endClean,
        ],
    ];

    // 2. จุดสำคัญ: สร้าง "เวลาปัจจุบัน" (Zero Point) จาก Input โดยตรง (ไม่เกี่ยวกับ past/future)
    const refDateISO = new Date(refTimeInput.value).toISOString();
    const refTimeClean = refDateISO.slice(0, 16); // นี่คือ "ตอนนี้" ในหน้าปัดนาฬิกาของคุณ

    // 3. คำนวณ Deadline 5 นาทีถัดไปนับจาก "ตอนนี้"
    const fiveMinsDeadline = new Date(
        new Date(refDateISO).getTime() + 5 * 60000,
    )
        .toISOString()
        .slice(0, 16);

    if (map.getLayer('fire-layer-fill')) {
        map.setFilter('fire-layer-fill', filter);

        map.setLayoutProperty('fire-layer-fill', 'fill-sort-key', [
            '*',
            -1,
            ['to-number', ['get', 'target_time_unix']],
        ]);

        map.setPaintProperty('fire-layer-fill', 'fill-color', [
            'case',
            // ก้อนที่เกิดก่อน refTime (อดีตตามที่ระบุใน past mins) -> สีเทา
            [
                '<',
                ['slice', ['to-string', ['get', 'target_time']], 0, 16],
                refTimeClean,
            ],
            '#4a4a4a',

            // ก้อนที่อยู่ระหว่าง refTime ถึง +5 นาที (ปัจจุบัน/วิกฤต) -> สีแดงสด
            [
                '<=',
                ['slice', ['to-string', ['get', 'target_time']], 0, 16],
                fiveMinsDeadline,
            ],
            '#ff1a1a',

            // ก้อนที่เหลือ (อนาคตตามที่ระบุใน future mins) -> สีส้มทอง
            '#ffcc00',
        ]);

        // map.setPaintProperty('fire-layer-fill', 'fill-opacity', [
        //     'case',
        //     [
        //         '<',
        //         ['slice', ['to-string', ['get', 'target_time']], 0, 16],
        //         refTimeClean,
        //     ],
        //     0.4,
        //     [
        //         '<=',
        //         ['slice', ['to-string', ['get', 'target_time']], 0, 16],
        //         fiveMinsDeadline,
        //     ],
        //     0.85,
        //     0.5,
        // ]);
    }

    if (map.getLayer('fire-layer-outline')) {
        map.setFilter('fire-layer-outline', filter);
    }

    console.log('Timeline Ref Point:', refTimeClean);
    console.log('Red Zone Deadline:', fiveMinsDeadline);
}

// เพิ่มปุ่มควบคุม (Zoom In/Out)
map.addControl(new maplibregl.NavigationControl(), 'top-left');

function addUnixTime(geojson) {
    geojson.features = geojson.features.map((f) => ({
        ...f,
        properties: {
            ...f.properties,
            target_time_unix: new Date(f.properties.target_time).getTime(),
        },
    }));
    return geojson;
}

function setupFireLayers() {
    const wfsUrl = `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=fire_forecast&OUTPUTFORMAT=application/json`;

    fetch(wfsUrl)
        .then((r) => r.json())
        .then((geojson) => {
            fireGeoJSON = addUnixTime(geojson);
            map.addSource('fire-source', {
                type: 'geojson',
                data: geojson,
            });
            map.addLayer({
                id: 'fire-layer-fill',
                type: 'fill',
                source: 'fire-source',
                layout: {
                    'fill-sort-key': ['to-number', ['get', 'target_time_unix']],
                },
                paint: {
                    // ตั้งค่าพื้นฐานไว้ก่อน executeFilter จะมาทับค่านี้เองครับ
                    'fill-color': '#ff1a1a',
                    'fill-opacity': 1.0,
                },
            });
        });

    map.on('idle', function initialFilter() {
        if (map.getSource('fire-source') && map.isSourceLoaded('fire-source')) {
            applyFireFilter(false);
            map.off('idle', initialFilter);
        }
    });
}

function setupRouteLayersWCS() {
    // กำหนด Mapping ระหว่างค่าใน Select กับ ID ของ Layer และสี
    const routeMapping = [
        {
            value: 'patrol_car',
            layerId: 'car-layer',
            sourceId: 'car-source',
            typeName: 'car',
            color: '#ffff00',
            width: 3,
        },
        {
            value: 'patrol_motorcycle',
            layerId: 'bike-layer',
            sourceId: 'bike-source',
            typeName: 'bike',
            color: '#00ffff',
            width: 2,
        },
        {
            value: 'patrol_walking',
            layerId: 'walk-layer',
            sourceId: 'walk-source',
            typeName: 'walk',
            color: '#33ff33',
            width: 2,
        },
    ];

    const patrolSelect = $('#patrol-select'); // ใช้ jQuery เพราะเป็น bootstrap-select

    routeMapping.forEach((route) => {
        // 1. เพิ่ม Source
        map.addSource(route.sourceId, {
            type: 'geojson',
            data: `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=${route.typeName}&OUTPUTFORMAT=application/json&SIMPLIFY=10`,
        });

        // 2. เพิ่ม Layer
        map.addLayer({
            id: route.layerId,
            type: 'line',
            source: route.sourceId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                // เช็คค่าเริ่มต้นจาก Select ว่าให้โชว์เลยไหม
                visibility: patrolSelect.val().includes(route.value)
                    ? 'visible'
                    : 'none',
            },
            paint: {
                'line-color': route.color,
                'line-width': route.width,
                'line-opacity': 0.8,
            },
        });
    });

    // 3. ดักจับ Event การเปลี่ยนค่า (รองรับทั้งเลือกรายตัว และ Select All)
    patrolSelect.on('change', function () {
        const selectedValues = $(this).val() || []; // ดึงค่าที่ถูกเลือกทั้งหมดออกมาเป็น Array

        routeMapping.forEach((route) => {
            const isVisible = selectedValues.includes(route.value);
            map.setLayoutProperty(
                route.layerId,
                'visibility',
                isVisible ? 'visible' : 'none',
            );
        });

        console.log('Updated Routes Visibility:', selectedValues);
    });
}

function setupRouteLayersWFS() {
    const routeMapping = [
        { value: 'patrol_car', typeName: 'car' },
        { value: 'patrol_motorcycle', typeName: 'bike' },
        { value: 'patrol_walking', typeName: 'walk' },
    ];

    const patrolSelect = $('#patrol-select');

    routeMapping.forEach((route) => {
        map.addSource(`${route.typeName}-source`, {
            type: 'raster',
            tiles: [
                `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${route.typeName}&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=TRUE`,
            ],
            tileSize: 256,
        });

        map.addLayer({
            id: `${route.typeName}-layer`,
            type: 'raster',
            source: `${route.typeName}-source`,
            layout: {
                visibility: patrolSelect.val().includes(route.value)
                    ? 'visible'
                    : 'none',
            },
        });
    });

    // Event 'change' ของ Select ใช้ Logic เดิมได้เลยครับ
}

function setupRouteLayersLazy() {
    const routeMapping = [
        {
            value: 'patrol_car',
            layerId: 'car-layer',
            sourceId: 'car-source',
            typeName: 'car',
            color: '#ffff00',
            width: 3,
        },
        {
            value: 'patrol_motorcycle',
            layerId: 'bike-layer',
            sourceId: 'bike-source',
            typeName: 'bike',
            color: '#00ffff',
            width: 2,
        },
        {
            value: 'patrol_walking',
            layerId: 'walk-layer',
            sourceId: 'walk-source',
            typeName: 'walk',
            color: '#33ff33',
            width: 2,
        },
    ];

    const patrolSelect = $('#patrol-select');

    patrolSelect.on('change', function () {
        const selectedValues = $(this).val() || [];

        routeMapping.forEach((route) => {
            const isVisible = selectedValues.includes(route.value);
            const source = map.getSource(route.sourceId);

            if (isVisible) {
                // ถ้ายังไม่มี Source ให้สร้างใหม่
                if (!source) {
                    console.log(`Initial loading for: ${route.typeName}`);

                    // 1. เพิ่ม Source (ใส่ URL ให้ครบ)
                    map.addSource(route.sourceId, {
                        type: 'geojson',
                        data: `${qgisUrl}/ows/?MAP=/data/edge.qgs&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=${route.typeName}&OUTPUTFORMAT=application/json&SIMPLIFY=10`,
                    });

                    // 2. เช็คตำแหน่งที่จะแทรก (ให้อยู่ใต้ไฟ)
                    const beforeId = map.getLayer('fire-layer-outline')
                        ? 'fire-layer-outline'
                        : undefined;

                    // 3. เพิ่ม Layer (วาง beforeId ไว้นอก Object)
                    map.addLayer(
                        {
                            id: route.layerId,
                            type: 'line',
                            source: route.sourceId,
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round',
                                visibility: 'visible',
                            },
                            paint: {
                                'line-color': route.color,
                                'line-width': route.width,
                                'line-opacity': 0.8,
                            },
                        },
                        beforeId,
                    );
                } else {
                    // ถ้ามีอยู่แล้ว แค่สั่งเปิด
                    map.setLayoutProperty(
                        route.layerId,
                        'visibility',
                        'visible',
                    );
                }
            } else {
                // ถ้าติ๊กออก และเลเยอร์ถูกสร้างไว้แล้ว ให้สั่งปิด
                if (source && map.getLayer(route.layerId)) {
                    map.setLayoutProperty(route.layerId, 'visibility', 'none');
                }
            }
        });
    });

    // รันครั้งแรกเพื่อเช็กค่า Default ที่ selected ไว้
    patrolSelect.trigger('change');
}

map.on('load', async () => {
    if (initForecastId) {
        try {
            const url = `/api/forecast/${initForecastId}`;

            const response = await axios.get(url);
            if (response.data.status !== 'success') {
                throw new Error(`[GET] Error: เกิดข้อผลพลาด`);
            }
            const forecast = response.data.data.forecast;

            // --- เริ่มต้นเติม TODO ---

            // 1. เลื่อนแผนที่ไปที่ตำแหน่งพิกัดของ Forecast นี้
            if (forecast.longitude && forecast.latitude) {
                map.jumpTo({
                    center: [forecast.longitude, forecast.latitude],
                    zoom: 14, // หรือระยะซูมที่คุณต้องการ
                });
                console.log(
                    `Map moved to: ${forecast.longitude}, ${forecast.latitude}`,
                );
            }

            // 2. เซตเวลา 'เวลาที่ตรวจสอบ' (refTimeInput) ให้เป็นเวลาที่สร้าง Forecast
            if (forecast.startTime) {
                const createdDate = new Date(forecast.startTime);
                // ใช้ฟังก์ชัน formatToLocalISO ที่คุณเขียนไว้ด้านบน
                refTimeInput.value = formatToLocalISO(createdDate);
                console.log(`Input time set to: ${refTimeInput.value}`);
            }
        } catch (error) {
            console.error('Failed to fetch initial forecast data:', error);
        }
    }

    // 4. หลังจากเซตค่า Metadata เสร็จแล้ว ค่อยเพิ่ม Source และ Layer ข้อมูลไฟ
    // setupRouteLayersWCS();
    // setupRouteLayersWFS();
    setupRouteLayersLazy();
    setupFireLayers();
});

// ดักจับ Event เมื่อปุ่มถูกกด
// submitBtn.addEventListener('click', () => {
//     console.log('--- Manual Update Triggered ---');
//     applyFireFilter(true); // สั่ง fetch ใหม่
// });
filterForm.addEventListener('submit', (e) => {
    // สำคัญมาก: ป้องกันไม่ให้หน้าเว็บ Refresh (ซึ่งเป็นค่าปกติของ form)
    e.preventDefault();

    console.log('--- Form Submitted (Enter or Click) ---');

    // ตรวจสอบค่าเหมือนเดิม
    if (!refTimeInput.value) {
        alert('กรุณาเลือกเวลาตรวจสอบก่อนครับ');
        return;
    }

    // รันฟังก์ชันเดิมที่คุณเขียนไว้
    applyFireFilter(true);
});
