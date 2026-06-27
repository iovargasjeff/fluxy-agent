from datetime import datetime
from typing import Any


def render_markdown_report(title: str, summary: str, sections: dict[str, Any]) -> str:
    lines = [
        f"# {title}",
        "",
        f"Generated at: {datetime.utcnow().isoformat()}Z",
        "",
        "## Summary",
        "",
        summary,
        "",
    ]

    for section_title, value in sections.items():
        lines.extend([f"## {section_title}", ""])
        if isinstance(value, list):
            for item in value:
                lines.append(f"- {item}")
        elif isinstance(value, dict):
            for key, item in value.items():
                lines.append(f"- **{key}**: {item}")
        else:
            lines.append(str(value))
        lines.append("")

    return "\n".join(lines).strip() + "\n"
