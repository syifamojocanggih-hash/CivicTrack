import re
from typing import Tuple

# Daftar kata kasar / tidak pantas umum (Indonesian & English vulgar words)
PROFANITY_WORDS = [
    "anjing", "babi", "bangsat", "bajingan", "kontol", "memek", "pantek",
    "kampret", "tolol", "goblok", "bodoh", "setan", "iblis", "tai", "jancok",
    "asu", "brengsek", "bejad", "perek", "pelacur", "lonte", "sialan",
    "bitch", "fuck", "shit", "asshole", "bastard"
]

_PROFANITY_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in PROFANITY_WORDS) + r")\b",
    re.IGNORECASE
)

def contains_profanity(text: str) -> bool:
    """Mengecek apakah teks mengandung kata-kata kasar."""
    if not text:
        return False
    return bool(_PROFANITY_PATTERN.search(text))

def sanitize_profanity(text: str) -> str:
    """Mengganti kata-kata kasar dengan tanda bintang (sensor)."""
    if not text:
        return text

    def replace_match(match):
        word = match.group(0)
        return word[0] + "*" * (len(word) - 1)

    return _PROFANITY_PATTERN.sub(replace_match, text)
