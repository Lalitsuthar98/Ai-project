import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";


function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your AI workspace."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;