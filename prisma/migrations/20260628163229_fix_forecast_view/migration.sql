DROP VIEW IF EXISTS v_forecast_polygons;
CREATE VIEW v_forecast_polygons AS
SELECT 
    CAST(row_number() OVER () AS INTEGER) AS id,
    fr.id AS original_uuid,
    fr.minutes,
    (COALESCE(f.start_time, f.created_at) + (fr.minutes || ' minutes')::interval) AS target_time,
    ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON((fr.geojson_data->'geometry')::text)), 4326)::geometry(Geometry, 4326) AS geom
FROM "forecast_result" fr
JOIN "forecast" f ON fr.forecast_id = f.id;