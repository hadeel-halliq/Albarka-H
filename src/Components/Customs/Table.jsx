import pen from "../../images/pen.png";
import deletIcon from "../../images/deletIcon.png";
import { useEffect, useState } from "react";
import { TfiArrowCircleLeft } from "react-icons/tfi";
import { TfiArrowCircleRight } from "react-icons/tfi";

export default function Table({
  headers,
  data,
  onDeleteRow,
  onSaveRow,
  onEditRow,
  rowIdKey = "id",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState(data);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});

  // الباجينيشن
  const rowsPerPage = 5;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  const handleDecrement = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleIncrement = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleDelete = async (rowIndex) => {
    const globalIndex = indexOfFirstRow + rowIndex;
    const row = tableData[globalIndex];
    if (onDeleteRow) {
      // Pass the full row object instead of separate id and row
      onDeleteRow(row);
      return;
    }
    setTableData((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  // بدء التعديل
  const handleEdit = (row, rowIndex) => {
    const globalIndex = indexOfFirstRow + rowIndex;
    setEditingIndex(globalIndex);
    setEditedRow(row);
  };
  // حفظ التعديلات
  const handleSave = async () => {
    if (onSaveRow) {
      const targetRow = tableData[editingIndex];
      await onSaveRow(targetRow?.[rowIdKey], editedRow, targetRow);
    } else {
      setTableData((prev) =>
        prev.map((r, i) => (i === editingIndex ? editedRow : r))
      );
    }
    setEditingIndex(null);
    setEditedRow({});
  };
  // إلغاء التعديل
  const handleCancel = () => {
    setEditingIndex(null);
    setEditedRow({});
  };

  // لما يصير تعديل على الداتا بسبب الفترة في صفحة الرسائل
  useEffect(() => {
    setTableData(data);
  }, [data]);

  return (
    <>
      <table className="min-w-[900px] table-auto w-full text-center border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
        <thead >
          <tr className="bg-primary border-b border-gray-200">
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentRows.map((row, rowIndex) => {
            const globalIndex = indexOfFirstRow + rowIndex;

            return (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-right text-sm text-gray-700">
                    {/*  عمود الإجراءات */}
                    {header.key === "actions" ? (
                      <div className="flex justify-center gap-2">
                        {editingIndex === globalIndex ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <div className="flex mr-[-18px]">
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors"
                              onClick={() => onEditRow ? onEditRow(row) : handleEdit(row, rowIndex)}
                              title="تعديل"
                            >
                              <img src={pen} alt="edit" className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rowIndex)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                              title="حذف"
                            >
                              <img src={deletIcon} alt="delete" className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : editingIndex === globalIndex ? (
                      //  حقل إدخال لتعديل أي عمود
                      <input
                        type="text"
                        value={editedRow[header.key] || ""}
                        onChange={(e) =>
                          setEditedRow({
                            ...editedRow,
                            [header.key]: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : header.render ? (
                      header.render(row[header.key], row)
                    ) : (
                      row[header.key]
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* pagenation */}
      <div className="flex justify-center items-center gap-3 mt-4" dir="rtl">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-5 py-2 rounded-3xl cursor-pointer font-semibold transition-all ${currentPage === i + 1
                ? "bg-primary text-white"
                : "bg-white text-primary hover:bg-primary/10"
              }`}
          >
            {i + 1}
          </button>
        ))}
        <TfiArrowCircleRight
          onClick={handleDecrement}
          disabled={currentPage === 1}
          className="text-primary text-3xl font-bold cursor-pointer"
        />
        <TfiArrowCircleLeft
          onClick={handleIncrement}
          disabled={currentPage === totalPages}
          className="text-primary text-3xl font-bold cursor-pointer"
        />
      </div>
    </>
  );
}
