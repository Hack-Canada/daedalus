import Link from "next/link";

type Props = {
  showSignIn?: boolean;
  showSignUp?: boolean;
  showResetPassword?: boolean;
  showContactUs?: boolean;
  customSignInLabel?: string;
};

const AuthFooter = ({
  showSignIn = true,
  showSignUp = true,
  showResetPassword = true,
  showContactUs = true,
  customSignInLabel,
}: Props) => {
  const hasLinks = showResetPassword || showContactUs;
  
  return (
    <div className="flex flex-col gap-4 pt-2">
      {(showSignIn || showSignUp) && (
        <div className="flex flex-col gap-2">
          {showSignIn && (
            <p className="text-white/60 text-center text-sm">
              {customSignInLabel || "Already have an account?"}{" "}
              <Link
                href="/sign-in"
                className="cursor-pointer text-[#85B7F1] hover:text-white font-medium transition-all hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}
          {showSignUp && (
            <p className="text-white/60 text-center text-sm">
              New to Hack Canada?{" "}
              <Link
                href="/sign-up"
                className="cursor-pointer text-[#85B7F1] hover:text-white font-medium transition-all hover:underline"
              >
                Sign Up
              </Link>
            </p>
          )}
        </div>
      )}
      {hasLinks && (
        <div className="flex items-center justify-center gap-6 text-sm">
          {showResetPassword && (
            <Link
              href="/forgot-password"
              className="cursor-pointer text-[#85B7F1] hover:text-white font-medium transition-all hover:underline"
            >
              Forgot password?
            </Link>
          )}
          {showContactUs && (
            <Link
              href="mailto:hi@hackcanada.org"
              target="_blank"
              className="cursor-pointer text-[#85B7F1] hover:text-white font-medium transition-all hover:underline"
            >
              Need help?
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthFooter;
