<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <!-- Информация о задаче -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-3xl font-bold text-gray-900">{{ task.name }}</h2>
        <p class="mt-4 text-gray-600 text-lg">{{ task.description }}</p>
        <div class="mt-6 flex items-center justify-between">
          <span class="text-xl font-semibold text-green-600"
            >{{ task.price }} руб.</span
          >
          <span
            :class="{
              'bg-blue-100 text-blue-800': task.status === 'Открыто',
              'bg-yellow-100 text-yellow-800': task.status === 'На выполнении',
              'bg-green-100 text-green-800': task.status === 'Завершена',
            }"
            class="px-4 py-1 rounded-full text-sm font-medium"
          >
            {{ task.status }}
          </span>
        </div>
        <div v-if="task.executors" class="mt-6">
          <p
            class="text-gray-700 mb-2"
            v-for="executorId in task.executors"
            :key="executorId"
          >
            Исполнитель:
            <span class="font-semibold">{{
              executors[executorId]?.fullName
            }}</span>
          </p>
        </div>
      </div>

      <!-- Чат -->
      <div
        class="p-6"
        v-if="user.role == 'executor' || user.id == task.customer_id"
      >
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Чат</h3>
        <div class="space-y-4">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="{
              'flex-row-reverse': users[message.userid]?.role === 'executor',
            }"
            class="flex items-start gap-3 animate-fade-in"
          >
            <div
              :class="{
                'bg-blue-50': users[message.userid]?.role === 'customer',
                'bg-green-50': users[message.userid]?.role === 'executor',
              }"
              class="p-4 rounded-xl max-w-[70%] shadow-sm"
            >
              <p class="text-sm font-medium text-gray-700">
                {{ users[message.userid]?.fullName }} ({{
                  users[message.userid]?.role === 'customer'
                    ? 'Заказчик'
                    : 'Исполнитель'
                }})
              </p>
              <p class="text-gray-600 mt-1">{{ message.text }}</p>
              <p class="text-xs text-gray-400 mt-2">
                {{ formatDate(message.created_at) }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-6 flex gap-2">
          <input
            v-model="newMessage"
            placeholder="Введите сообщение"
            class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            @click="sendMessage"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Отправить
          </button>
        </div>
      </div>

      <!-- Кнопка для исполнителя -->
      <div
        v-if="authStore.user?.role === 'executor' && task.status === 'Открыто'"
        class="p-6 border-t border-gray-200"
      >
        <button
          @click="acceptTask"
          class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 animate-pulse"
        >
          Принять задачу
        </button>
      </div>
      <div
        v-if="
          authStore.user?.role === 'executor' &&
          task.status === 'На выполнении' &&
          !task.executors.includes(user.id)
        "
        class="p-6 border-t border-gray-200"
      >
        <button
          @click="acceptTask"
          class="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all transform hover:scale-105 animate-pulse"
        >
          Присоединиться к выполнению задачи
        </button>
      </div>
      <div
        v-if="
          task.status === 'На выполнении' && task.executors.includes(user.id)
        "
        class="p-6 border-t border-gray-200"
      >
        <div
          class="w-full px-6 py-3 bg-red-500 text-white rounded-lg text-center"
        >
          Вы уже выполняете задачу
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const task = ref({
  id: route.params.id,
  name: '',
  description: '',
  price: '',
  status: '', // Открыто, На выполнении, Завершена
  customer_id: null, // ID заказчика
  executor_id: null, // ID исполнителя
  executor: null, // Данные исполнителя
  executors: [],
});

const messages = ref([]); // Сообщения из базы данных
const users = ref({}); // Объект для хранения данных пользователей
const newMessage = ref('');
const user = ref(authStore.user);
const executors = ref({});

watchEffect(() => {
  user.value = authStore.user;
});

const loadExecutors = async () => {
  if (task.value.executors && task.value.executors.length > 0) {
    try {
      for (const executorId of task.value.executors) {
        const executorResponse = await fetch(
          `https://9f51fbeefc3b53a7.mokky.dev/users/${executorId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (executorResponse.ok) {
          const executorData = await executorResponse.json();
          executors.value[executorId] = executorData;
        } else {
          console.error(`Ошибка загрузки пользователя с ID ${executorId}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке исполнителей:', error);
    }
  }
};

// Загрузка данных задачи, сообщений и пользователей
const loadTaskAndMessages = async () => {
  try {
    const taskResponse = await fetch(
      `https://9f51fbeefc3b53a7.mokky.dev/tasks/${task.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    if (taskResponse.ok) {
      task.value = await taskResponse.json();
      await loadExecutors();
    } else {
      throw new Error('Ошибка загрузки задачи');
    }

    // Загрузка сообщений
    const messagesResponse = await fetch(
      `https://9f51fbeefc3b53a7.mokky.dev/messages?task_id=${task.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    if (messagesResponse.ok) {
      messages.value = await messagesResponse.json();

      // Загрузка данных пользователей
      const userIds = [...new Set(messages.value.map((msg) => msg.userid))];
      for (const userId of userIds) {
        const userResponse = await fetch(
          `https://9f51fbeefc3b53a7.mokky.dev/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          users.value[userId] = userData;
        }
      }
      if (localStorage.getItem('token')) {
        await authStore.authMe();
      }
    } else {
      throw new Error('Ошибка загрузки сообщений');
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

// Форматирование даты
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// Отправка сообщения
const sendMessage = async () => {
  if (newMessage.value.trim()) {
    try {
      const response = await fetch(
        'https://9f51fbeefc3b53a7.mokky.dev/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            task_id: task.value.id,
            userid: user.value.id,
            text: newMessage.value,
            created_at: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        const newMessageData = await response.json();
        messages.value.push(newMessageData);
        newMessage.value = '';

        if (!users.value[authStore.user.id]) {
          const userResponse = await fetch(
            `https://9f51fbeefc3b53a7.mokky.dev/users/${authStore.user.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            users.value[authStore.user.id] = userData;
          }
        }
      } else {
        throw new Error('Ошибка отправки сообщения');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
};

// Принятие задачи
const acceptTask = async () => {
  try {
    const taskResponse = await fetch(
      `https://9f51fbeefc3b53a7.mokky.dev/tasks/${task.value.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!taskResponse.ok) {
      throw new Error('Ошибка загрузки задачи');
    }

    const currentTask = await taskResponse.json();
    const currentExecutors = currentTask.executors || [];

    if (!currentExecutors.includes(user.value.id)) {
      currentExecutors.push(user.value.id);
    }

    const updateResponse = await fetch(
      `https://9f51fbeefc3b53a7.mokky.dev/tasks/${task.value.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          executors: currentExecutors,
          status: 'На выполнении',
        }),
      }
    );

    if (updateResponse.ok) {
      task.value.executors = currentExecutors;
      task.value.status = 'На выполнении';
      task.value.executor_id = user.value.id;
      task.value.executor = user.value;
    } else {
      throw new Error('Ошибка при обновлении задачи');
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

// Загрузка данных при монтировании компонента
onMounted(loadTaskAndMessages);
</script>

<style>
/* Анимация для сообщений */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Анимация для кнопки */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
</style>
