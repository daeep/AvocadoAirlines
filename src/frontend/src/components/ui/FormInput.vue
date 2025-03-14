<template>
  <div class="form-group" :class="{ 'has-error': hasError }">
    <label :for="id" v-if="label">{{ label }}</label>
    <div class="input-container">
      <input
        :type="type"
        :id="id"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :required="required"
        :readonly="readonly"
        :disabled="disabled"
        :pattern="pattern"
        :autocomplete="autocomplete"
        @input="updateValue($event.target.value)"
        @blur="touched = true"
      />
      <span v-if="type === 'password'" class="password-toggle" @click="togglePasswordVisibility">
        <i :class="showPassword ? 'icon-eye-slash' : 'icon-eye'"></i>
      </span>
    </div>
    <small v-if="hasError" class="error-message">{{ errorMessage }}</small>
    <small v-if="helpText && !hasError" class="help-text">{{ helpText }}</small>
  </div>
</template>

<script>
export default {
  name: 'FormInput',
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: null
    },
    autocomplete: {
      type: String,
      default: 'on'
    },
    helpText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    showError: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      touched: false,
      showPassword: false
    };
  },
  computed: {
    hasError() {
      return (this.touched || this.showError) && this.errorMessage;
    }
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value);
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const input = document.getElementById(this.id);
      input.type = this.showPassword ? 'text' : 'password';
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.input-container {
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.has-error input {
  border-color: #dc3545;
}

.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.error-message {
  display: block;
  color: #dc3545;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.help-text {
  display: block;
  color: #6c757d;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #6c757d;
}

.password-toggle:hover {
  color: #4CAF50;
}
</style> 