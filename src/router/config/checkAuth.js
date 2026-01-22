import { useUserStore } from "@/stores/userStore";
import { jwtDecode} from 'jwt-decode';

export async function checkAuth(to, from, next) {
  const authToken = localStorage.getItem('authToken');
  const userStore = useUserStore();

  if (userStore.roleChangePopUpVisible) {
    console.warn('路由攔截器：角色變更彈窗開啟，不進行路由攔截');
    return next(false);
  }

  if (to.meta.requiresAuth === false) {
    return next();
  }

  if (!authToken) {
    return next({ name: 'Login' });
  }

  try {
    const decodedToken = jwtDecode(authToken);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('authToken');
      return next({ name: 'Login' });
    }

    if (userStore.isFirst === false && to.name === 'NewMemberPassword') {
      return next ({ name: 'NewMemberPassword' });
    }

    return next();
  } catch (error) {
    localStorage.removeItem('authToken');
    return next({ name: 'Login' });
  }
}