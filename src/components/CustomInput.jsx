const CustomInput = (props) => {
  const { 
    type, 
    name, 
    placeholder, 
    value, 
    onChange, 
    onBlur, 
    autocomplete, 
    select, 
    className, 
    children,
    min,
    max,
    error // Add error prop
  } = props;
  
  if (select) {
    return (
      <div>
        <select 
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`${className || "form-control"}${error ? " is-invalid" : ""}`}
          autoComplete={autocomplete}
        >
          {children}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
  
  return (
    <div className="form-floating">
      <input 
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`form-control ${className || ""}${error ? " is-invalid" : ""}`}
        autoComplete={autocomplete}
        min={min}
        max={max}
      />
      {placeholder && <label htmlFor={name}>{placeholder}</label>}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default CustomInput;