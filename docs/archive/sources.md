# Archived Source References

Fluxy was bootstrapped as a clean monorepo. Previous Git history was intentionally not imported.

## Local Rescue Snapshots

```txt
base/sources/fluxsql-main
```

Source role: original FluxSQL web/main snapshot.

```txt
base/sources/fluxsql-desktop-branch
```

Source role: original FluxSQL desktop branch snapshot.

```txt
base/sources/data-generator-main
```

Source role: original data generator snapshot.

## Salvage Buckets

```txt
base/salvage/frontend/fluxsql-web
base/salvage/backend-cloud-nest/fluxsql-backend-app
base/salvage/desktop-tauri/src-tauri
base/salvage/local-sidecar-fastapi/backend-python
base/salvage/synthetic-data/backend
base/salvage/docs-reference/data-generator-docs
```

## Cleanup Guidance

Keep `base/` until the MVP demo has been run manually end to end. After that, it can be archived outside the active product tree or replaced with this reference document and release tags.

