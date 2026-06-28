-- AlterTable
ALTER TABLE "forecast" ADD COLUMN     "start_time" TIMESTAMP(3);

DROP VIEW IF EXISTS v_forecast_polygons;
CREATE VIEW v_forecast_polygons AS
SELECT 
    CAST(fr.id AS INTEGER) AS id, 
    fr.forecast_id,
    fr.minutes,
    ST_SetSRID(ST_Force2D(ST_GeomFromGeoJSON((fr.geojson_data->'geometry')::text)), 4326)::geometry(Geometry, 4326) AS geom,
    f.created_at,
    (COALESCE(f.start_time, f.created_at) + (fr.minutes || ' minutes')::interval) AS target_time
FROM "forecast_result" fr
JOIN "forecast" f ON fr.forecast_id = f.id;
