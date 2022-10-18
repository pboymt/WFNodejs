import { onMounted, ref, defineComponent } from 'vue';

export const TestComponent = defineComponent({
    template:/* html */`
        <div class="comp-test">
            <h1>Hello World</h1>
            <p>You have <a @click="increment()">clicked</a> {{ count }} times!</p>
        </div>
    `,
    setup() {
        const count = ref(0)
        const increment = () => count.value++;
        return {
            count,
            increment
        }
    },

    mounted() {
        console.log(this.count);
    }
});
