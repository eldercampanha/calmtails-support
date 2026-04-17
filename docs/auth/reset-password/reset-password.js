function getConfig() {
  var config = window.CALMTAILS_RESET_CONFIG || {};

  return {
    supabaseUrl: String(config.supabaseUrl || "").trim(),
    supabasePublicKey: String(config.supabaseAnonKey || config.supabasePublishableKey || "").trim(),
    supabaseJsCdnUrl: String(config.supabaseJsCdnUrl || "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm").trim(),
    appOpenUrl: String(config.appOpenUrl || "calmtails://").trim(),
    minPasswordLength: Number(config.minPasswordLength || 10)
  };
}

function hasAnyRecoveryParams(params) {
  return Boolean(
    params.get("access_token") ||
    params.get("refresh_token") ||
    params.get("code") ||
    params.get("token_hash") ||
    params.get("type") ||
    params.get("error") ||
    params.get("error_code")
  );
}

function getParams(locationLike) {
  var params = new URLSearchParams(locationLike.search || "");
  var hash = String(locationLike.hash || "");

  if (hash.indexOf("#") === 0) {
    new URLSearchParams(hash.slice(1)).forEach(function (value, key) {
      params.set(key, value);
    });
  }

  return params;
}

function getRecoveryState(params) {
  return {
    accessToken: params.get("access_token") || "",
    refreshToken: params.get("refresh_token") || "",
    code: params.get("code") || "",
    tokenHash: params.get("token_hash") || "",
    type: String(params.get("type") || "").toLowerCase(),
    error: String(params.get("error") || "").toLowerCase(),
    errorCode: String(params.get("error_code") || "").toLowerCase(),
    errorDescription: String(params.get("error_description") || "")
  };
}

function cleanUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function getFormError(password, confirmPassword, minLength) {
  if (password.length < minLength) {
    return "Password must be at least " + minLength + " characters.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

function getErrorMessage(error, fallback) {
  var message = error && error.message ? String(error.message).trim() : "";
  return message || fallback;
}

function isUsableAppUrl(value) {
  var appUrl = String(value || "").trim();

  if (!appUrl) return false;
  if (appUrl === "#" || appUrl.toLowerCase() === "about:blank") return false;

  return /^[a-z][a-z0-9+.-]*:/.test(appUrl) || appUrl.indexOf("/") === 0;
}

function createLogger() {
  var lines = [];
  var node = document.getElementById("debug-log");
  var debugEnabled = /(^|[?#&])debug=1([&#]|$)/.test(window.location.href);

  function write(level, message, data) {
    var line = "[" + level + "] " + message;
    if (typeof data !== "undefined") {
      line += " " + JSON.stringify(data);
    }

    lines.push(line);

    if (debugEnabled && node) {
      node.hidden = false;
      node.textContent = lines.join("\n");
    }

    if (level === "error") {
      console.error("[CalmTails Reset]", message, data || "");
    } else {
      console.log("[CalmTails Reset]", message, data || "");
    }
  }

  return {
    info: function (message, data) {
      write("info", message, data);
    },
    error: function (message, data) {
      write("error", message, data);
    }
  };
}

function buildUi(config) {
  var title = document.getElementById("title");
  var instruction = document.getElementById("instruction");
  var message = document.getElementById("message");
  var form = document.getElementById("reset-form");
  var passwordInput = document.getElementById("password");
  var confirmInput = document.getElementById("confirm-password");
  var formError = document.getElementById("form-error");
  var submitButton = document.getElementById("submit-button");
  var openAppLink = document.getElementById("open-app-link");
  var successActions = document.getElementById("success-actions");
  var hasAppLink = isUsableAppUrl(config.appOpenUrl);

  if (hasAppLink) {
    openAppLink.href = config.appOpenUrl;
  } else {
    successActions.hidden = true;
  }

  function showForm() {
    message.hidden = true;
    form.hidden = false;
    successActions.hidden = true;
    title.textContent = "Reset your password";
    instruction.textContent = "Enter a new password for your CalmTails account.";
  }

  function showError(text) {
    form.hidden = true;
    successActions.hidden = true;
    title.textContent = "Reset your password";
    instruction.textContent = "This reset link is invalid or expired.";
    message.textContent = text;
    message.className = "message message-error";
    message.hidden = false;
  }

  function showSuccess() {
    form.reset();
    clearFormError();
    form.hidden = true;
    successActions.hidden = !hasAppLink;
    title.textContent = "Password updated";
    instruction.textContent = "Your password has been reset successfully.";
    message.textContent = "You can now sign in with your new password.";
    message.className = "message message-success";
    message.hidden = false;
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Updating..." : "Update password";
  }

  function clearFormError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  function setFormError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  passwordInput.addEventListener("input", clearFormError);
  confirmInput.addEventListener("input", clearFormError);

  return {
    form: form,
    passwordInput: passwordInput,
    confirmInput: confirmInput,
    minPasswordLength: config.minPasswordLength,
    showForm: showForm,
    showError: showError,
    showSuccess: showSuccess,
    setSubmitting: setSubmitting,
    clearFormError: clearFormError,
    setFormError: setFormError
  };
}

async function createSupabaseClient(config) {
  var module = await import(config.supabaseJsCdnUrl);

  return module.createClient(config.supabaseUrl, config.supabasePublicKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: true,
      persistSession: false
    }
  });
}

async function establishRecoverySession(client, state, logger) {
  var sessionResult;

  if (state.error || state.errorCode || state.errorDescription) {
    throw new Error(state.errorDescription || "This reset link is invalid or expired.");
  }

  if (state.type && state.type !== "recovery" && hasAnyRecoveryParams(getParams(window.location))) {
    throw new Error("This reset link is invalid or expired.");
  }

  sessionResult = await client.auth.getSession();
  logger.info("session after client init", {
    hasSession: Boolean(sessionResult.data && sessionResult.data.session),
    eventType: state.type || ""
  });

  if (sessionResult.data && sessionResult.data.session) {
    return sessionResult.data.session;
  }

  if (state.accessToken && state.refreshToken) {
    logger.info("attempting setSession", {
      hasAccessToken: true,
      hasRefreshToken: true
    });

    sessionResult = await client.auth.setSession({
      access_token: state.accessToken,
      refresh_token: state.refreshToken
    });

    if (sessionResult.error) throw sessionResult.error;
    return sessionResult.data.session;
  }

  if (state.code) {
    logger.info("attempting exchangeCodeForSession", {
      hasCode: true
    });

    var codeResult = await client.auth.exchangeCodeForSession(state.code);
    if (codeResult.error) throw codeResult.error;
    return codeResult.data.session;
  }

  if (state.tokenHash) {
    logger.info("attempting verifyOtp", {
      hasTokenHash: true,
      type: "recovery"
    });

    var otpResult = await client.auth.verifyOtp({
      token_hash: state.tokenHash,
      type: "recovery"
    });

    if (otpResult.error) throw otpResult.error;
    return otpResult.data.session;
  }

  throw new Error("This reset link is invalid or expired.");
}

async function initialize() {
  var config = getConfig();
  var ui = buildUi(config);
  var logger = createLogger();
  var state = getRecoveryState(getParams(window.location));
  var authEvents = [];

  logger.info("page loaded", {
    href: window.location.href,
    search: window.location.search || "",
    hash: window.location.hash || ""
  });
  logger.info("parsed recovery params", {
    type: state.type || "",
    hasAccessToken: Boolean(state.accessToken),
    hasRefreshToken: Boolean(state.refreshToken),
    hasCode: Boolean(state.code),
    hasTokenHash: Boolean(state.tokenHash),
    error: state.error || "",
    errorCode: state.errorCode || "",
    errorDescription: state.errorDescription || ""
  });

  if (!config.supabaseUrl || !config.supabasePublicKey) {
    logger.error("missing public config");
    ui.showError("This reset page is not configured correctly.");
    return;
  }

  var client;

  try {
    client = await createSupabaseClient(config);
    client.auth.onAuthStateChange(function (event, session) {
      authEvents.push(event);
      logger.info("auth event", {
        event: event,
        hasSession: Boolean(session)
      });
    });

    var session = await establishRecoverySession(client, state, logger);

    if (!session || !session.user) {
      throw new Error("This reset link is invalid or expired.");
    }

    logger.info("session established", {
      hasUser: Boolean(session.user),
      authEvents: authEvents
    });
    cleanUrl();
    ui.showForm();
  } catch (error) {
    logger.error("session establishment failed", {
      message: error && error.message ? error.message : String(error),
      authEvents: authEvents
    });
    cleanUrl();
    ui.showError(getErrorMessage(error, "This reset link is invalid or expired. Request a new password reset email from the app."));
    return;
  }

  ui.form.addEventListener("submit", async function (event) {
    event.preventDefault();
    ui.clearFormError();

    var password = ui.passwordInput.value;
    var confirmPassword = ui.confirmInput.value;
    var formError = getFormError(password, confirmPassword, ui.minPasswordLength);

    if (formError) {
      ui.setFormError(formError);
      return;
    }

    ui.setSubmitting(true);

    try {
      logger.info("attempting password update");
      var updateResult = await client.auth.updateUser({
        password: password
      });

      if (updateResult.error) throw updateResult.error;

      await client.auth.signOut();
      logger.info("password update succeeded");
      ui.showSuccess();
    } catch (error) {
      logger.error("password update failed", {
        message: error && error.message ? error.message : String(error)
      });
      ui.setFormError(getErrorMessage(error, "Unable to reset password. Request a new reset email and try again."));
    } finally {
      ui.setSubmitting(false);
    }
  });
}

initialize();
