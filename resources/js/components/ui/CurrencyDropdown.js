import { useEffect, useRef, useState } from "react";

const Dropdown = ({ options, selectedOption, setSelectedOption }) => {
    const [isOpen, setOpen] = useState(false);
    const dropdown = useRef(null);

    // Open/Close on click of dropdown header
    const toggleDropdown = () => setOpen(!isOpen);

    // Update selected option, close dropdown
    const handleItemClick = (currency) => {
        setSelectedOption(currency);
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
                {selectedOption
                    ? options.find(
                          (option) =>
                              option.currency === selectedOption.currency
                      )?.currency
                    : "select a token"}
            </div>
            <div className={`dropdown-body ${isOpen && "open"}`}>
                <ul>
                    {(options || []).map((item, index) => (
                        <li
                            className="dropdown-item"
                            id={item.currency}
                            key={item.currency}
                            onClick={(e) => {
                                handleItemClick(item);
                            }}
                        >
                            {item.currency}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dropdown;
