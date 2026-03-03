(function (global) {
  "use strict";

  function parseParamString(raw) {
    var output = {};
    if (!raw) return output;

    var normalized = raw.charAt(0) === "?" || raw.charAt(0) === "#" ? raw.slice(1) : raw;
    if (!normalized) return output;

    var entries = new URLSearchParams(normalized);
    entries.forEach(function (value, key) {
      output[key] = value;
    });

    return output;
  }

  function mergeObjects(a, b) {
    var merged = {};
    var key;

    for (key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key)) merged[key] = a[key];
    }
    for (key in b) {
      if (Object.prototype.hasOwnProperty.call(b, key)) merged[key] = b[key];
    }

    return merged;
  }

  function hasAnyToken(params) {
    return Boolean(
      params.access_token ||
      params.refresh_token ||
      params.token ||
      params.token_hash ||
      params.code ||
      params.session
    );
  }

  function includesAny(value, tokens) {
    var i;
    for (i = 0; i < tokens.length; i += 1) {
      if (value.indexOf(tokens[i]) !== -1) return true;
    }
    return false;
  }

  function getState(params) {
    var error = String(params.error || "").toLowerCase();
    var errorCode = String(params.error_code || "").toLowerCase();
    var errorDescription = String(params.error_description || "").toLowerCase();
    var type = String(params.type || params.flow || "").toLowerCase();
    var hasToken = hasAnyToken(params);

    var expiredTokens = ["expired", "otp_expired", "token_expired", "link_expired"];
    var invalidTokens = ["invalid", "bad", "malformed", "used", "already_used", "invalid_grant", "access_denied"];

    var hasError = Boolean(error || errorCode || errorDescription);
    var errorBlob = [error, errorCode, errorDescription].join(" ");

    if (hasError) {
      if (includesAny(errorBlob, expiredTokens)) return "expired";
      if (includesAny(errorBlob, invalidTokens)) return "invalid";
      return "unknown_error";
    }

    if (hasToken) {
      if (type === "recovery") return "success_recovery";
      return "success_confirmed";
    }

    if (type === "recovery" || type === "signup" || type === "invite" || type === "magiclink") {
      return "expired";
    }

    if (Object.keys(params).length > 0) {
      return "invalid";
    }

    return "unknown_error";
  }

  function maskValue(key, value) {
    var secretKeys = {
      access_token: true,
      refresh_token: true,
      token: true,
      token_hash: true,
      code: true,
      session: true
    };

    if (!secretKeys[key]) return value;

    if (!value) return "";
    if (value.length <= 8) return "********";
    return value.slice(0, 4) + "..." + value.slice(-4);
  }

  function maskParams(params) {
    var sanitized = {};
    var key;
    for (key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        sanitized[key] = maskValue(key, String(params[key]));
      }
    }
    return sanitized;
  }

  function parseAuthCallbackState(locationLike) {
    var queryParams = parseParamString(locationLike.search || "");
    var hashParams = parseParamString(locationLike.hash || "");
    var params = mergeObjects(queryParams, hashParams);
    var state = getState(params);

    return {
      state: state,
      params: params,
      debugParams: maskParams(params)
    };
  }

  global.CalmTailsAuthParser = {
    parseAuthCallbackState: parseAuthCallbackState
  };
})(window);
