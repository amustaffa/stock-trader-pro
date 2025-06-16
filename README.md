# Stock Trader Pro - Angular Stock Trading Application

A comprehensive Angular application for stock trading that follows industry best practices and modern development standards.

## Features

### Core Functionality
- **User Authentication**: Secure login/logout with JWT token management
- **Real-time Dashboard**: Portfolio overview with gain/loss tracking
- **Portfolio Management**: View holdings, trade history, and performance metrics
- **Stock Trading**: Buy/sell orders with market and limit order types
- **Watchlist**: Track favorite stocks and monitor performance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Technical Features
- **Angular 20**: Latest Angular framework with standalone components
- **Angular Material**: Professional UI components and theming
- **TypeScript**: Full type safety and modern JavaScript features
- **RxJS**: Reactive programming for data streams and async operations
- **Route Guards**: Protected routes for authenticated users
- **HTTP Interceptors**: Centralized error handling and authentication
- **Lazy Loading**: Optimized performance with code splitting
- **Progressive Web App**: Mobile-first design with offline capabilities

## Architecture

### Project Structure
```
src/
├── app/
│   ├── auth/                    # Authentication components
│   │   └── login/
│   ├── core/                    # Core services and utilities
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # TypeScript interfaces
│   │   └── services/            # Business logic services
│   ├── features/                # Feature modules
│   │   ├── dashboard/           # Main dashboard
│   │   ├── portfolio/           # Portfolio management
│   │   ├── trade/               # Trading functionality
│   │   └── watchlist/           # Stock watchlist
│   └── shared/                  # Shared components and utilities
├── environments/                # Environment configurations
└── assets/                      # Static assets
```

### Design Patterns
- **Service Layer Pattern**: Separation of business logic from components
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: NgRx for reactive data flow
- **Guard Pattern**: Route protection and access control
- **Interceptor Pattern**: Cross-cutting concerns (auth, error handling)
- **Component Composition**: Reusable and maintainable UI components

## Setup Instructions for Mac

### Prerequisites
1. **Node.js** (v18 or higher)
   ```bash
   # Install using Homebrew
   brew install node
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Angular CLI**
   ```bash
   # Install globally
   npm install -g @angular/cli
   
   # Verify installation
   ng version
   ```

### Installation
1. **Clone the repository** (if from a repository)
   ```bash
   git clone <repository-url>
   cd angular-stock-trading
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Update `src/environments/environment.ts` with your API endpoints
   - For production, update `src/environments/environment.prod.ts`

### Development Server
```bash
# Start the development server
npm start

# Or using Angular CLI
ng serve

# The application will be available at http://localhost:4200
```

### Building for Production
```bash
# Build the application
npm run build

# Build for production with optimizations
ng build --configuration production

# The built files will be in the dist/ directory
```

### Testing
```bash
# Run unit tests
ng test

# Run end-to-end tests
ng e2e

# Run tests with coverage
ng test --code-coverage
```

## Demo Credentials

For testing purposes, use these demo credentials:
- **Username**: demo
- **Password**: password123

## API Integration

The application is designed to work with a RESTful API. Update the `environment.ts` file with your backend API URL.

### Expected API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/stocks` - Get stock list
- `GET /api/stocks/:symbol` - Get specific stock data
- `GET /api/portfolio` - Get user portfolio
- `POST /api/trades` - Execute trade orders
- `GET /api/trades/history` - Get trade history
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

## Error Handling

The application includes comprehensive error handling:
- **HTTP Interceptors**: Automatic error handling for API calls
- **User-friendly Messages**: Clear error messages with snackbar notifications
- **Loading States**: Visual feedback during async operations
- **Offline Support**: Graceful degradation when network is unavailable

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Guards**: Protected routes for authenticated users only
- **HTTP Interceptors**: Automatic token attachment to requests
- **XSS Protection**: Angular's built-in sanitization
- **CSRF Protection**: Configurable CSRF protection

## Performance Optimizations

- **Lazy Loading**: Routes are loaded on demand
- **Tree Shaking**: Unused code elimination
- **OnPush Change Detection**: Optimized change detection strategy
- **Service Workers**: Caching and offline functionality
- **Bundle Optimization**: Code splitting and minification

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Contributing

1. Follow the Angular Style Guide
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Follow the established project structure
5. Use meaningful commit messages

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please refer to the Angular documentation or create an issue in the project repository.