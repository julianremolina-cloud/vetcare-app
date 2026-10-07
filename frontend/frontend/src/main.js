import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { Quasar, Notify, Dialog, Loading } from 'quasar';

// Iconos y tipografía de Quasar
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/roboto-font/roboto-font.css';
import 'quasar/src/css/index.sass';

// Estilos personalizados
import './css/app.scss';

import App from './App.vue';
import router from './router/index.js';
import axiosBoot from './boot/axios.js';

const app = createApp(App);

// Configurar Pinia con plugin de persistencia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

// Configurar Quasar con sus plugins oficiales
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading
  },
  config: {
    notify: {
      position: 'top-right',
      timeout: 3500
    }
  }
});

// Inicializar boot de Axios
axiosBoot({ app });

app.mount('#app');
