import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building, learning, and exploring with Nova AI."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;