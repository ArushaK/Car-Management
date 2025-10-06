# Car Configurator

A modern, interactive 3D car configurator built with React, TypeScript, and Three.js that allows users to customize various aspects of a vehicle in real-time.

## Features

- Interactive 3D car model visualization
- Real-time customization of car features (color, wheels, interior, etc.)
- Responsive design for all devices
- Performance optimized rendering
- Detailed specification and pricing information
- Configuration saving and sharing

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Bundler**: Vite
- **Routing**: React Router DOM
- **Form Management**: React Hook Form
- **UI Libraries**: Material UI + Tailwind CSS
- **3D Rendering**: React Three Fiber
- **Logging**: Windsor
- **Error Handling**: React Error Boundary
- **Design Patterns**: Container/Presentation, Component Composition, HOCs, etc.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/car-configurator.git
cd car-configurator

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173/`.

### Build for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## Project Structure

See [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for detailed information about the project organization.

## Design Patterns

See [DESIGN_PATTERNS.md](./docs/DESIGN_PATTERNS.md) for information about the design patterns used in this project.

## Testing

```bash
# Run tests
npm run test
# or
yarn test
```

## Deployment

This project can be deployed to any static hosting service:

1. Build the project using `npm run build`
2. Deploy the contents of the `dist` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request