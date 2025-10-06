# Project Structure

This document outlines the folder structure and organization principles of the Car Configurator project.

## Directory Structure

```
car-configurator/
├── .github/                  # GitHub specific configurations
├── public/                   # Static assets
│   ├── models/               # 3D car models
│   ├── textures/             # Textures for 3D models
│   └── favicon.ico           # Site favicon
├── src/                      # Source code
│   ├── assets/               # Project assets (images, fonts, etc.)
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Shared components across features
│   │   ├── configurator/     # Components specific to car configuration
│   │   │   ├── ColorPicker/
│   │   │   ├── WheelSelector/
│   │   │   └── ...
│   │   └── layout/           # Layout components (Header, Footer, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context providers
│   ├── pages/                # Page components
│   │   ├── Configurator/
│   │   ├── Home/
│   │   └── ...
│   ├── services/             # API and external services
│   │   ├── api/              # API clients and methods
│   │   └── threeJS/          # Three.js service abstractions
│   ├── store/                # State management
│   │   ├── actions/
│   │   ├── reducers/
│   │   └── index.ts
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   │   ├── helpers/
│   │   ├── constants/
│   │   └── logging/          # Windsor logging setup
│   ├── App.tsx               # Main App component
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite type declarations
├── tests/                    # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── index.html                # HTML entry point
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # Project overview
```

## Key Directories and Their Purposes

### `/src/components`

Contains all reusable UI components organized by feature or purpose.

- **`/common`**: Shared components like buttons, inputs, modals
- **`/configurator`**: Components specifically for the car configuration experience
- **`/layout`**: Components for page structure like headers, navigation, footers

Each component should have its own directory with the following structure:

```
ComponentName/
├── index.ts               # Re-exports the component
├── ComponentName.tsx      # Component implementation
├── ComponentName.test.tsx # Component tests
└── ComponentName.styles.ts # Component-specific styles (if not using Tailwind)
```

### `/src/hooks`

Custom React hooks that abstract complex logic:

```
hooks/
├── useCarModel.ts         # Hook for loading and manipulating 3D car models
├── useCarOptions.ts       # Hook for managing car configuration options
└── useConfiguratorState.ts # Hook for managing configurator state
```

### `/src/context`

React context providers for state that needs to be accessed by many components:

```
context/
├── ConfiguratorContext.tsx # Context for car configuration state
└── ThemeContext.tsx       # Context for theme management
```

### `/src/pages`

Top-level page components corresponding to routes:

```
pages/
├── Home/                  # Landing page
├── Configurator/          # Main configurator page
├── Summary/               # Configuration summary page
└── ErrorPage/             # Error page
```

### `/src/services`

Services that interface with external APIs or provide functionality:

```
services/
├── api/                   # API clients and methods
│   ├── configService.ts   # Service for fetching car configuration options
│   └── userService.ts     # Service for user-related operations
└── threeJS/               # Three.js service abstractions
    ├── modelLoader.ts     # Service for loading 3D models
    └── sceneManager.ts    # Service for managing Three.js scenes
```

### `/src/store`

State management using reducers:

```
store/
├── actions/               # Action creators
├── reducers/              # Reducers organized by domain
└── index.ts              # Store configuration
```

### `/src/utils`

Helper functions, constants, and utilities:

```
utils/
├── helpers/               # Helper functions
│   ├── formatters.ts      # Formatting functions
│   └── validators.ts      # Validation functions
├── constants/             # Application constants
│   ├── carOptions.ts      # Car configuration options
│   └── routes.ts          # Route definitions
└── logging/               # Windsor logging setup
    └── logger.ts          # Logger configuration
```

## File Naming Conventions

- **Components**: PascalCase for component files (e.g., `ColorPicker.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCarModel.ts`)
- **Context**: PascalCase with 'Context' suffix (e.g., `ConfiguratorContext.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE for the constants themselves, but camelCase for the files (e.g., `carOptions.ts`)
- **Type definitions**: PascalCase with descriptive names (e.g., `CarConfigurationType.ts`)

## Import Order

For consistency, maintain the following import order in all files:

1. React and React-related packages
2. Third-party libraries
3. Project components
4. Hooks
5. Context
6. Types
7. Utils
8. Styles

Example:

```typescript
// React and related packages
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Third-party libraries
import { TextField } from '@mui/material';
import { useForm } from 'react-hook-form';

// Project components
import { Button } from '@/components/common';

// Hooks
import { useCarModel } from '@/hooks';

// Context
import { useConfiguratorContext } from '@/context';

// Types
import { CarModelType } from '@/types';

// Utils
import { formatPrice } from '@/utils/helpers';

// Styles
import './ComponentName.styles.css';
```

## Code Organization Guidelines

1. **Component Structure**: Follow the Container/Presentation pattern where appropriate. Container components handle logic and state, while presentation components focus on rendering.

2. **Code Reusability**: Extract reusable logic into custom hooks.

3. **Type Safety**: Use TypeScript interfaces and types for all components and functions.

4. **Error Handling**: Implement Error Boundaries at appropriate levels in the component tree.

5. **Performance**: Implement code-splitting and lazy loading for routes and heavy components.

6. **Accessibility**: Ensure all components are accessible by following WAI-ARIA guidelines.
