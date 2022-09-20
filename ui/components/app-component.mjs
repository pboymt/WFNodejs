import { onMounted } from 'vue';
import { ref } from 'vuw';

export default {
    setup() {
        const count = ref(0)
    },

    mounted() {
        console.log(this.count);
    }
}