import { useEffect, useState } from "react";
import Card from "./Card";
import { FiX } from "react-icons/fi";

export default function CardList({
  headers,
  data,
  order,
  onDeleteRow,
  onSaveRow,
  onEditRow,
  onRowClick,
  rowIdKey = "id",
}) {
  const [rows, setRows] = useState(data);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [currentKey, setCurrentKey] = useState(null);
  const [editedValue, setEditedValue] = useState("");

  const handleEdit = (rowIndex, key) => {
    if (onEditRow) {
      onEditRow(rows[rowIndex]);
      return;
    }
    setCurrentRowIndex(rowIndex);
    setCurrentKey(key);
    setEditedValue(rows[rowIndex][key] || "");
    setIsModelOpen(true);
  };

  const handleDelete = async (index) => {
    const row = rows[index];
    if (onDeleteRow) {
      onDeleteRow(row);
      return;
    }
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleSave = async () => {
    const targetRow = rows[currentRowIndex];
    if (onSaveRow) {
      await onSaveRow(
        targetRow?.[rowIdKey],
        { ...targetRow, [currentKey]: editedValue },
        targetRow
      );
      setIsModelOpen(false);
      return;
    }
    const updatedRows = [...rows];
    updatedRows[currentRowIndex][currentKey] = editedValue;
    setRows(updatedRows);
    setIsModelOpen(false);
  };

  useEffect(() => {
    setRows(data);
  }, [data]);

  return (
    <div className="block md:hidden space-y-4 my-10" dir="rtl">
      {rows.map((row, index) => {
        const cardData = order.map((key) => {
          const header = headers.find((h) => h.key === key);
          let value = row[key];

          if (header && header.render) {
            value = header.render(value, row);
          }

          return {
            header: header ? header.key : key,
            title: header ? header.label : key,
            value,
          };
        });

        return (
          <div key={row[rowIdKey] || index} className="animate-fadeIn">
            <Card
              data={cardData}
              onEdit={(key) => handleEdit(index, key)}
              onDelete={() => handleDelete(index)}
              onClick={() => onRowClick && onRowClick(row)}
            />
          </div>
        );
      })}

      {/* مودل التعديل - محسّن */}
      {isModelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setIsModelOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden animate-slideUp"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary/10 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <FiX className="w-5 h-5 rotate-45" />
                تعديل البيانات
              </h2>
              <button
                onClick={() => setIsModelOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                aria-label="إغلاق"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <input
                type="text"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-right"
                dir="rtl"
                autoFocus
              />

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setIsModelOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}