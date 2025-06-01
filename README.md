# Enterprise Architecture Visualization

A **metadata-driven**, dynamic web application for visualizing Enterprise Architecture mappings. Renders Business Capabilities → Applications & Data, Applications → Technology, and Technology → Infrastructure with colorful icons and an interactive UI.

![EA Visualization](https://img.shields.io/badge/Enterprise-Architecture-06b6d4?style=flat)
![Metadata-Driven](https://img.shields.io/badge/Metadata-Driven-22c55e?style=flat)

## Features

- **Business Capabilities → Applications & Data Architecture** — Map capabilities to supporting applications and data stores
- **Applications → Technology** — Application dependency hierarchy and technology stack
- **Technology → Infrastructure** — Trace technology components to underlying infrastructure
- **Search** — Search across capabilities, applications, technology; view top-down and top-up dependencies
- **Metadata-driven** — Fully dynamic; edit `data/metadata.json` to model your own architecture
- **Colorful icons** — Font Awesome icons per layer
- **No build step** — Static HTML, CSS, and JavaScript

## Quick Start

```bash
# Install (optional — uses npx, no install needed)
npm install

# Run the app
npm start
```

Then open **http://localhost:3000**

### Alternative: Python or other server

```bash
python -m http.server 8000
# or
npx serve . -l 3000
```

## Project Structure

```
ea-visualization-app/
├── data/
│   └── metadata.json    # Architecture metadata (edit this!)
├── index.html           # Main application
├── package.json         # npm scripts
└── README.md            # This file
```

## Customizing

Edit `data/metadata.json` to add your own:
- Business capabilities and sub-capabilities
- Applications (with `dependsOnIds` for dependency hierarchy)
- Foundation services
- Data architecture
- Technologies and infrastructure

Use [Font Awesome](https://fontawesome.com/icons) icon names (e.g. `fa-database`, `fa-cloud`, `fa-brands fa-stripe`).

## License

MIT
