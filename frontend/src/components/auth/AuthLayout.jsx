import { Sparkles, ShieldCheck, Zap } from "lucide-react";

import "./AuthLayout.css";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-page">

      {/* Left side */}
      <div className="auth-brand-panel">

        <div className="auth-brand">

          <div className="auth-logo">
            <Sparkles size={20} />
          </div>

          <span>Nova AI</span>

        </div>


        <div className="auth-brand-content">

          <div className="brand-badge">
            <span></span>
            AI workspace
          </div>

          <h1>
            Think faster.
            <br />
            <span>Build smarter.</span>
          </h1>

          <p>
            A clean AI workspace for learning, coding,
            exploring ideas, and getting things done.
          </p>

        </div>


        <div className="auth-features">

          <div className="auth-feature">
            <div>
              <Zap size={17} />
            </div>

            <span>Fast AI responses</span>
          </div>

          <div className="auth-feature">
            <div>
              <ShieldCheck size={17} />
            </div>

            <span>Secure conversations</span>
          </div>

        </div>

      </div>


      {/* Right side */}
      <div className="auth-form-panel">

        <div className="auth-mobile-logo">

          <div className="auth-logo">
            <Sparkles size={18} />
          </div>

          <span>Nova AI</span>

        </div>


        <div className="auth-form-container">

          <div className="auth-heading">

            <h2>{title}</h2>

            <p>{subtitle}</p>

          </div>

          {children}

        </div>

      </div>

    </div>
  );
}

export default AuthLayout;