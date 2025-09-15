class Validator {
  static isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  static minLength(value, len) {
    return typeof value === 'string' && value.length >= len;
  }
}

class AuthService {
  authenticate(email, password) {
    throw new Error('Not implemented');
  }
}

class MockAuthService extends AuthService {
  authenticate(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'teste@upf.br' && password === '123456') {
          resolve({ ok: true, name: 'Usuário Exemplo' });
        } else {
          resolve({ ok: false, error: 'Credenciais inválidas' });
        }
      }, 700);
    });
  }
}

const ServiceFactory = (() => {
  return {
    createAuthService: () => new MockAuthService()
  };
})();

class LoginForm {
  constructor({ formEl, authService }) {
    this.form = formEl;
    this.auth = authService;
    this.email = this.form.querySelector('#email');
    this.password = this.form.querySelector('#password');
    this.message = this.form.querySelector('#message');
    this.toggle = this.form.querySelector('#togglePwd');
    this.submitBtn = this.form.querySelector('#submitBtn');

    this._attach();
  }

  _attach() {
    this.form.addEventListener('submit', (e) => this._onSubmit(e));
    this.toggle.addEventListener('click', () => this._togglePassword());
  }

  _togglePassword() {
    const t = this.password;
    t.type = t.type === 'password' ? 'text' : 'password';
    this.toggle.textContent = t.type === 'password' ? '👁️' : '🙈';
  }

  async _onSubmit(event) {
    event.preventDefault();
    this._setMessage('');
    const email = this.email.value.trim();
    const pwd = this.password.value;

    if (!Validator.isEmail(email)) {
      this._setMessage('Informe um e-mail válido.');
      return;
    }
    if (!Validator.minLength(pwd, 4)) {
      this._setMessage('Senha muito curta (mínimo 4 caracteres).');
      return;
    }

    this._busy(true);
    try {
      const res = await this.auth.authenticate(email, pwd);
      if (res.ok) {
        this._setMessage('Bem-vindo, ' + res.name + '!');
        this.form.reset();

        window.location.href = "tela1.html";
      } else {
        this._setMessage(res.error || 'Falha ao autenticar.');
      }
    } catch (err) {
      this._setMessage('Erro de rede.');
      console.error(err);
    } finally {
      this._busy(false);
    }
  }

  _setMessage(msg) {
    this.message.textContent = msg;
  }

  _busy(isBusy) {
    this.submitBtn.disabled = isBusy;
    this.submitBtn.textContent = isBusy ? 'Entrando...' : 'Entrar';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const authService = ServiceFactory.createAuthService(); // DI
  const formEl = document.getElementById('loginForm');
  new LoginForm({ formEl, authService });
});
