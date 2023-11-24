#Inheritance policy

For each parameter calculation calculations are made in this order:
- if parameter in note-settings has is's own value (excluding None, Undefined, etc.), then this field does not inherite this parameter from parent.
- if the parameter is in default position or has a value Undefined, None, etc., then its value is calculated as the value of the same parameter in the parent_settings of the parent note.
- if parent note has this parameter, set to default, then algorithm checks this value in parent note of the parent note.
- if all parent notes of chosen note have their parameters set to *undefined*, then chosen note inherite *undefined* value.

