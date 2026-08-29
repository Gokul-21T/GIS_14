# GIS Land Governance MVP

A small feasibility prototype showing how local GIS parcel geometry can be joined to unified land records. It uses only demo data near a clearly labelled demonstration location in India; no boundaries or records represent official cadastral data.

## Technology

React, Vite, Leaflet, React-Leaflet, OpenStreetMap, GeoJSON and local JSON.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Data structure

`src/data/parcels.geojson` holds 30 polygon features and the map/search fields. Every feature has a `parcel_id`. `src/data/landRecords.json` is keyed by the same ID and contains the richer registration, tax, location, and deterministic conflict notes. The application joins them only in the browser.

## Included MVP functions

- Interactive OpenStreetMap parcel map with status colours, hover and click selection
- Search by parcel ID, survey number, or owner name
- Dynamic parcel-status dashboard, map-layer filters and legend
- Unified record panel and deterministic examples of area, owner, land-use and tax conflicts
- Responsive desktop and mobile layout

## Limitations and Phase 2

This has mock client-side data only: no validation workflow, spatial database, authentication, official integrations, or real cadastral boundaries. A suitable Phase 2 adds a secured API, PostgreSQL/PostGIS, authoritative source connectors, role-based review workflows, provenance/audit logs, and data-quality validation.
