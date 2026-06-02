import { CanActivateFn } from '@angular/router';

import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {

  const auth = inject(AuthService);

  const router = inject(Router);

  const user = auth.getUser();

  // ✅ Admin Access
  if (user && user.role === 'admin') {

    return true;

  }

  // ❌ Unauthorized
 console.log('Unauthorized Access ❌ Admin Only');

  router.navigate(['/user/dashboard']);

  return false;

};