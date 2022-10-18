import { createApp, ref } from 'vue';
import ElementPlus, {
    ElContainer, ElAside, ElFooter, ElMain, ElHeader,
    ElButton, ElMenu, ElIcon, ElMenuItem, ElMenuItemGroup
} from 'element-plus';
import { router } from './router.mjs';
import { TestComponent } from './components/test-component.mjs';

const app = createApp({
    template: /* html */ `
    <el-container>
        <el-aside width="200px">
        <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        >
            <el-menu-item index="1">
            <el-icon><icon-menu /></el-icon>
            <span>Navigator Two</span>
            </el-menu-item>
            <el-menu-item index="2" disabled>
            <el-icon><document /></el-icon>
            <span>Navigator Three</span>
            </el-menu-item>
            <el-menu-item index="3">
            <el-icon><setting /></el-icon>
            <span>Navigator Four</span>
            </el-menu-item>
        </el-menu>
        </el-aside>
        <router-view></router-view>
    </el-container>
    `,
    setup() {
        const count = ref(0);
        return {
            count
        };
    },
    components: {
        ElContainer,
        ElAside,
        ElFooter,
        ElHeader,
        ElMain,
        ElButton,
        ElMenu, ElIcon, ElMenuItem, ElMenuItemGroup
    }
});

app.use(ElementPlus);
app.use(router);
app.mount('#app');