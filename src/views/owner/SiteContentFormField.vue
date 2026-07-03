<template>
  <div class="form-field">
    <label class="field-label">{{ label }}</label>
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-input"
      :disabled="disabled"
      rows="3"
    ></textarea>
    <input
      v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      class="form-input"
      :disabled="disabled"
    />
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  disabled: Boolean,
  type: { type: String, default: 'text' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
}
.form-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
  box-sizing: border-box;
  resize: vertical;
}
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
  border-color: transparent;
  padding-left: 0;
}
textarea.form-input { min-height: 60px; }
</style>
