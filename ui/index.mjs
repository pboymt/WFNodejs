import { createApp } from 'vue';

const app = createApp({
    template: /* html */ `
        <div>
            <h1>Hello World</h1>
            <p>You have <a @click="increment()">clicked</a> {{ count }} times!</p>
        </div>
    `,
    data() {
        return {
            count: 0
        }
    },
    methods: {
        increment() {
            this.count++;
        }
    }
});

app.mount('#app');