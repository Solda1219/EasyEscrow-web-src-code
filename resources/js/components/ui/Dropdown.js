import { useEffect, useRef, useState } from "react";

const CustomDropdown = ({ options, selectedOption, setSelectedOption }) => {
    const [isOpen, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(selectedOption);
    const dropdown = useRef(null);

    // Open/Close on click of dropdown header
    const toggleDropdown = () => setOpen(!isOpen);

    // Update selected option, close dropdown
    const handleItemClick = (item) => {
        setSelectedValue(item);
        setSelectedOption(item.key);
        setOpen(false);
    };

    // Close dropdown when clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdown.current && !dropdown.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdown]);

    return (
        <div className="dropdown" ref={dropdown}>
            <div className="dropdown-header" onClick={toggleDropdown}>
                {selectedValue
                    ? options.find((option) => option.key === selectedValue.key)
                          ?.label
                    : "select a token"}
            </div>
            <div className={`dropdown-body ${isOpen && "open"}`}>
                <ul>
                    {(options || []).map((item, index) => (
                        <li
                            className="dropdown-item"
                            id={item.key}
                            key={item.key}
                            onClick={(e) => {
                                handleItemClick(item);
                            }}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CustomDropdown;
