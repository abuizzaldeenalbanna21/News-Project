import hashlib
import hmac
import secrets


_PBKDF2_ITERATIONS = 600_000


def hash_password(password):
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt), _PBKDF2_ITERATIONS
    ).hex()
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt}${password_hash}"


def verify_password(password, stored_hash):
    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            algorithm, iterations, salt, expected_hash = stored_hash.split("$", 3)
            if algorithm != "pbkdf2_sha256":
                return False
            actual_hash = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                bytes.fromhex(salt),
                int(iterations),
            ).hex()
        except (ValueError, TypeError):
            return False
        return hmac.compare_digest(actual_hash, expected_hash)

    legacy_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_hash, stored_hash)


def needs_password_upgrade(stored_hash):
    return not stored_hash.startswith("pbkdf2_sha256$")
