import { Chip, MenuItem, Select } from '@mui/material';

export const leadColor = { New: 'info', Contacted: 'warning', Qualified: 'success', Lost: 'error' };
export const taskColor = { Pending: 'warning', 'In Progress': 'info', Done: 'success' };

// dropdown that displays the current value as a coloured chip
export default function StatusSelect({ value, options, colors, onChange, disabled }) {
  return (
    <Select
      size="small"
      variant="standard"
      disableUnderline
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      renderValue={(v) => <Chip size="small" label={v} color={colors[v] || 'default'} sx={{ fontWeight: 600 }} />}
      sx={{ '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' } }}
    >
      {options.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
    </Select>
  );
}
