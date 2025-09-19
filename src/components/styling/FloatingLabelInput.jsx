import React from 'react';

function FloatingLabelInput({ id, label, type, value, onChange }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        required
        className="peer w-full px-4 2xl:px-10 2xl:py-5 py-2 bg-button rounded-full bg-gray-100 placeholder-transparent dark:bg-button-dark
        focus:outline-none focus:ring-1 2xl:focus:ring-2 focus:ring-primary dark:focus:ring-hover-button-dark text-sm md:text-base 2xl:text-2xl "
        
      />
      <label
        htmlFor={id}
        className="
          absolute left-4 -top-3.5 text-xs text-label opacity-0 transition-all duration-300
          md:-top-4 md:text-sm
          2xl:left-8 2xl:-top-5 2xl:text-base

          peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-label peer-placeholder-shown:opacity-100
          md:peer-placeholder-shown:top-2 md:peer-placeholder-shown:text-base
          2xl:peer-placeholder-shown:top-5 2xl:peer-placeholder-shown:text-2xl

          peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-gray-500 dark:peer-focus:text-text-dark
          md:peer-focus:-top-4 md:peer-focus:text-sm
          2xl:peer-focus:-top-6 2xl:peer-focus:text-lg
        "
      >
        {label}
      </label>
    </div>
  );
}

export default FloatingLabelInput;