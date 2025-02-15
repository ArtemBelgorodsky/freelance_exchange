<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['taskId']);
const messages = ref([]);
const newMessage = ref('');

const fetchMessages = async () => {
  const response = await fetch(
    `https://9f51fbeefc3b53a7.mokky.dev/messages?task_id=${props.taskId}`
  );
  messages.value = await response.json();
};

const sendMessage = async () => {
  await fetch('https://9f51fbeefc3b53a7.mokky.dev/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_id: props.taskId,
      text: newMessage.value,
      user_id: authStore.user.id,
    }),
  });
  newMessage.value = '';
  fetchMessages();
};

onMounted(fetchMessages);
</script>

<template>
  <div class="chat-container">
    <div v-for="msg in messages" :key="msg.id">
      <p>{{ msg.text }}</p>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" />
    <button @click="sendMessage">Отправить</button>
  </div>
</template>
