<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Форма создания задачи -->
      <div v-if="user.role === 'customer'" class="create-task mb-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Создать задачу</h3>
        <p class="text-gray-600 mb-6">
          Создайте новую задачу, чтобы найти исполнителя. Укажите название,
          описание, бюджет и категорию.
        </p>
        <form @submit.prevent="createTask" class="space-y-4">
          <input
            v-model="newTask.name"
            placeholder="Название задачи"
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <textarea
            v-model="newTask.description"
            placeholder="Описание задачи"
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          ></textarea>
          <input
            v-model="newTask.price"
            type="number"
            placeholder="Бюджет"
            required
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <select
            required
            id="category-filter"
            v-model="selectedCategoryForm"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="" disabled selected hidden>
              Выберите категорию
            </option>
            <option value="Дизайн">Дизайн</option>
            <option value="Разработка ПО">Разработка ПО</option>
            <option value="Разработка игр">Разработка игр</option>
            <option value="Реклама">Реклама</option>
          </select>
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
          >
            Создать задачу
          </button>
        </form>
      </div>

      <!-- Список задач -->
      <div class="task-list">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Список задач</h3>
        <p class="text-gray-600 mb-6">
          Здесь отображаются все доступные задачи. Нажмите на задачу, чтобы
          увидеть подробности.
        </p>

        <!-- Фильтр по категориям -->
        <div class="mb-6">
          <label
            for="category-filter"
            class="block text-sm font-medium text-gray-700"
            >Фильтр по категории</label
          >
          <select
            id="category-filter"
            v-model="selectedCategory"
            class="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Все категории</option>
            <option value="Дизайн">Дизайн</option>
            <option value="Разработка ПО">Разработка ПО</option>
            <option value="Разработка игр">Разработка игр</option>
            <option value="Реклама">Реклама</option>
          </select>
        </div>

        <!-- Отображение задач -->
        <div class="space-y-6">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-card bg-white shadow-lg rounded-lg p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
            @click="goToTask(task.id)"
          >
            <h4 class="text-xl font-bold text-gray-900 mb-2">
              {{ task.name }}
            </h4>
            <p class="text-gray-600 mb-4">{{ task.description }}</p>
            <div class="flex items-center justify-between">
              <p class="text-gray-600">Бюджет: {{ task.price }} руб.</p>
              <p class="text-gray-600">Статус: {{ task.status }}</p>
            </div>
            <p class="text-gray-600">Категория: {{ task.category }}</p>
            <p class="text-gray-500 text-sm mt-4">
              Дата опубликования:
              {{ format(new Date(task.created_at), 'dd.MM.yyyy') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

const authStore = useAuthStore();
const router = useRouter();

const user = ref(authStore.user);
const tasks = ref([]);
const newTask = ref({
  name: '',
  description: '',
  price: 0,
});

// Добавляем переменную для выбранной категории
const selectedCategory = ref('');
const selectedCategoryForm = ref('');

watchEffect(() => {
  user.value = authStore.user;
});

// Вычисляемое свойство для фильтрации задач
const filteredTasks = computed(() => {
  if (!selectedCategory.value) {
    return tasks.value; // Если категория не выбрана, возвращаем все задачи
  }
  return tasks.value.filter((task) => task.category === selectedCategory.value);
});

const fetchTasks = async () => {
  const response = await fetch('https://9f51fbeefc3b53a7.mokky.dev/tasks', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  tasks.value = await response.json();
};

const createTask = async () => {
  if (user.value.role !== 'customer') return;

  const response = await fetch('https://9f51fbeefc3b53a7.mokky.dev/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      ...newTask.value,
      customer_id: user.value.id,
      status: 'Открыто',
      created_at: new Date().toISOString(),
      category: selectedCategoryForm.value,
    }),
  });

  if (response.ok) {
    await fetchTasks();
    newTask.value = { name: '', description: '', price: 0, category: '' }; // Сброс формы
  }
};

onMounted(async () => {
  if (localStorage.getItem('token')) {
    await authStore.authMe(); // Загружаем данные пользователя при инициализации приложения
  }
  fetchTasks();
});

const goToTask = (taskId) => {
  router.push(`/tasks/${taskId}`);
};
</script>

<style scoped>
/* Анимация для появления задач */
.task-card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Анимация для кнопки */
button {
  transition: background-color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

/* Эффект при наведении на кнопку */
button:hover {
  transform: scale(1.01);
}

/* Эффект при наведении на карточку задачи */
.task-card:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* Стили для выпадающего списка */
select {
  appearance: none;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: #3b82f6;
}
</style>
