<template>
  <header
    class="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-6 flex justify-between items-center shadow-lg mb-8"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg font-bold text-white">{{ user.fullName }}</span>
      <span
        class="text-sm text-black bg-opacity-20 bg-white px-2 py-1 rounded-full"
        v-if="user.role"
      >
        {{ user.role === 'customer' ? 'Заказчик' : 'Исполнитель' }}
      </span>
    </div>
    <button
      class="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 mr-4 cursor-pointer"
      @click="handleLogout"
    >
      Выйти
    </button>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { watchEffect, ref } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const user = ref(authStore.user);
watchEffect(() => {
  user.value = authStore.user;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/'); // Перенаправляем на страницу входа после выхода
};
</script>

<style scoped>
/* Анимация для кнопки */
button {
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Анимация для хедера */
header {
  transition: background 0.5s ease;
}

/* Эффект при наведении на кнопку */
button:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Эффект при нажатии на кнопку */
button:active {
  transform: scale(0.95);
}
</style>
