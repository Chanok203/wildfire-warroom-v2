const statusMap = {
    PENDING: 'รอดำเนินการ',
    CREATE_INPUT: 'กำลังสร้างข้อมูลนำเข้า',
    IN_QUEUE: 'อยู่ในคิว',
    PROCESSING: 'กำลังประมวลผล',
    COMPLETED: 'เสร็จสิ้น',
    FAILED: 'ล้มเหลว',
    CANCELED: 'ยกเลิกแล้ว',
};

const pushMap = {
    IDLE: 'ยังไม่ได้นำส่ง', // หรือ 'ว่าง'
    PENDING: 'รอนำส่ง',
    PUSHING: 'กำลังนำส่งข้อมูล',
    PUSHED: 'นำส่งสำเร็จ',
    FAILED: 'นำส่งล้มเหลว',
    CANCELED: 'ยกเลิกการส่ง',
};

const table = $('#forecast-table').DataTable({
    language: {
        search: 'ค้นหา',
        searchPlaceholder: 'ชื่อภารกิจ',
        info: 'แสดง _START_ ถึง _END_ จากทั้งหมด _TOTAL_',
        infoEmpty: 'ไม่พบข้อมูล',
    },
    processing: true,
    serverSide: true,
    ajax: {
        url: '/api/forecast',
        type: 'POST',
    },
    order: [[0, 'desc']],
    columns: [
        {
            data: 'startTime',
            render: function (data) {
                if (!data) return '-';
                const date = new Date(data);
                return date.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
            },
        },
        {
            data: 'name',
        },
        { data: 'droneName' },
        {
            data: null,
            render: function (data, type, row, meta) {
                return `(${data.latitude}, ${data.longitude})`;
            },
        },
        {
            data: 'aiStatus',
            render: function (data) {
                return statusMap[data];
            },
        },
        {
            data: 'pushStatus',
            render: function (data) {
                return pushMap[data];
            },
        },
        {
            data: null,
            render: function (data) {
                // ดึง data.url ที่ส่งมาจาก Service มาใช้ได้เลย!
                return `
                    <div class="d-flex flex-row gap-3">
                        <a href="/forecast/view?forecastId=${data.id}" target="_self" class="btn btn-primary btn-sm">
                            <i class="bi bi-eye"></i> ดูผลลัพธ์
                        </a>
                        <form action="/forecast/${data.id}/delete" method="POST" onsubmit="return confirm('คุณแน่ใจใช่หรือไม่ว่าจะลบ? (${data.name}, ${data.id})')">
                            <button class="btn btn-danger btn-sm">
                                <i class="bi bi-trash"></i> ลบออก
                            </button>
                        </form>
                        <form action="/forecast/${data.id}/push" method="POST">
                            <button class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-upload"></i> อัพโหลด
                            </button>
                        </form>
                    </div>
                `;
            },
        },
    ],
});

setInterval(() => {
    table.ajax.reload(null, false);
}, 5000);
