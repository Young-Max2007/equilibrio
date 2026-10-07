document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;
      const message = document.querySelector("#authMessage");

      try {
        const user = await loginUser(email, password);

        if (!user) {
          message.textContent = "E-mail ou senha incorretos.";
          return;
        }

        setSession(user.id);
        window.location.href = "principal.html";
      } catch (error) {
        console.error(error);
        message.textContent = "Não foi possível acessar sua conta.";
      }
    });
  }

  const registerForm = document.querySelector("#registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.querySelector("#name").value.trim();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value;
      const goal = document.querySelector("#goal").value;
      const message = document.querySelector("#authMessage");

      try {
        const user = await createUser(name, email, password);

        user.goal = goal;
        await put("users", user);

        setSession(user.id);
        window.location.href = "principal.html";
      } catch (error) {
        console.error(error);
        message.textContent = error.message || "Não foi possível criar a conta.";
      }
    });
  }
});
