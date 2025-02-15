import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {},
  }),
  actions: {
    async login(email, password) {
      const response = await fetch('https://9f51fbeefc3b53a7.mokky.dev/auth', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Неверный email или пароль');
      }

      const userData = await response.json();
      this.user = userData;
      console.log(this.user);
      localStorage.setItem('email', userData.data.email);
      localStorage.setItem('fullName', userData.data.fullName);
      localStorage.setItem('token', userData.token);
    },
    async register(email, password, role, fullName) {
      const response = await fetch(
        'https://9f51fbeefc3b53a7.mokky.dev/register',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role, fullName }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка регистрации. Возможно, email уже занят.');
      }

      const userData = await response.json();
      this.user = userData;
      localStorage.setItem('email', userData.data.email);
      localStorage.setItem('fullName', userData.data.fullName);
      localStorage.setItem('token', userData.token);
    },
    logout() {
      this.user = {};
      localStorage.removeItem('email');
      localStorage.removeItem('fullName');
      localStorage.removeItem('token');
    },
    async authMe() {
      try {
        if (localStorage.getItem('token')) {
          const response = await fetch(
            'https://9f51fbeefc3b53a7.mokky.dev/auth_me',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Ошибка загрузки пользователя');
          }
          const userData = await response.json();
          this.user = userData;
        }
      } catch (error) {
        console.error(error);
        this.logout();
      }
    },
  },
});
