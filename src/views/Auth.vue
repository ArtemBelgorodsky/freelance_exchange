<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div>
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Вход' : 'Регистрация' }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div v-if="!isLogin">
            <label for="fullName" class="sr-only">Имя</label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Имя"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Пароль</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Пароль"
            />
          </div>
          <div v-if="!isLogin">
            <label for="role" class="sr-only">Роль</label>
            <select
              id="role"
              v-model="role"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="" disabled selected>Выберите роль</option>
              <option value="customer">Заказчик</option>
              <option value="executor">Исполнитель</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
          <a
            href="#"
            @click="toggleMode"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-300"
          >
            {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
          </a>
        </p>
      </div>

      <div v-if="error" class="text-center text-sm text-red-600">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const isLogin = ref(true);
    const fullName = ref('');
    const email = ref('');
    const password = ref('');
    const role = ref('');
    const error = ref('');
    const authStore = useAuthStore();
    const router = useRouter();

    const handleSubmit = async () => {
      error.value = '';
      try {
        if (isLogin.value) {
          await authStore.login(email.value, password.value);
        } else {
          await authStore.register(
            email.value,
            password.value,
            role.value,
            fullName.value
          );
        }
        router.push('/tasks');
      } catch (err) {
        error.value = err.message || 'Ошибка авторизации';
      }
    };

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      error.value = '';
      role.value = '';
    };

    return {
      isLogin,
      fullName,
      email,
      password,
      role,
      error,
      handleSubmit,
      toggleMode,
    };
  },
};
</script>

<style scoped>
/* Анимация для кнопки */
button {
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

/* Анимация для ссылки */
a {
  transition: color 0.3s ease;
}

/* Эффект при наведении на кнопку */
button:hover {
  transform: scale(1.05);
}

/* Эффект при наведении на ссылку */
a:hover {
  color: #3b82f6;
  cursor: pointer;
}
</style>
