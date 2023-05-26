```
# Authology

The Authology is a comprehensive solution for integrating authentication into your Angular projects. It provides a set of tools, components, and guards that make the authentication process easier and more secure.

## Features

- User registration and login functionality
- Token-based authentication using JSON Web Tokens (JWT)
- Angular guards for protecting routes and restricting access

## Installation

You can install the Authology using npm. Run the following command:

```
npm install ngx-authology
```

## Usage

1. Import the `AuthologyService` into your Angular application:

```typescript
import { AuthologyService } from 'ngx-authology';

@NgModule({
  imports: [
    AuthologyService
  ],
  ...
})
export class AppModule { }
```

2. Add the authentication routes to your application's routing module:

```typescript
import { AuthologyRestrictedGuard } from 'ngx-authology';

const routes: Routes = [
  ...
  ...
  canActivate: [AuthologyRestrictedGuard],
  ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

3. Use the provided components and guards in your application:

- `AuthologyRestrictedGuard`: Protects routes and allows only authenticated users to access them. Example usage in route configuration:

  ```typescript
  import { AuthologyRestrictedGuard } from 'ngx-authology';

  const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthologyRestrictedGuard] },
    ...
  ];
  ```

- `AuthologyUnrestrictedGuard`: Protects routes and allows only unauthenticated users to access them. Example usage in route configuration:

```typescript
import { AuthologyUnrestrictedGuard } from 'ngx-authology';

const routes: Routes = [
  { path: 'landing', component: DashboardComponent, canActivate: [AuthologyUnrestrictedGuard] },
  ...
];
```

## Configuration

The Authology can be configured to fit your specific needs. Please refer to the documentation for detailed instructions on how to customize and extend the package.

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue on the GitHub repository. We appreciate your feedback and contributions to make this package better.

## License

This project is licensed under the [MIT License](LICENSE).