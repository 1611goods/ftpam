
import authService from 'teleport/services/auth';
import cfg from 'teleport/config';

export default function useChangePassword() {
  function changePassword(oldPass: string, newPass: string, otpToken: string) {
    return authService.changePassword(oldPass, newPass, otpToken);
  }

  function changePasswordWithWebauthn(oldPass: string, newPass: string) {
    return authService.changePasswordWithWebauthn(oldPass, newPass);
  }
  return {
    changePassword,
    changePasswordWithWebauthn,
    preferredMfaType: cfg.getPreferredMfaType(),
    auth2faType: cfg.getAuth2faType(),
  };
}

export type State = ReturnType<typeof useChangePassword>;
