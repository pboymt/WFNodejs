import { defineComponent, ref } from 'vue';
import { ElContainer, ElHeader, ElMain, ElFooter } from 'element-plus';

export default defineComponent({
    template:/* html */`
    <el-container>
    <el-header style="background-color: grey;">Header</el-header>
    <el-main><el-button>测试</el-button></el-main>
    <el-footer style="background-color: grey;">Footer</el-footer>
    </el-container>
    `,
    setup() {
        const count = ref(0)
        const increment = () => count.value++;
        return {
            count,
            increment
        }
    },
    components: {
        ElContainer,
        ElMain,
        ElFooter,
        ElHeader
    }
});
