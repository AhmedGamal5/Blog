const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const buttons = [];
  const maxPageButtons = 5;

  if (currentPage > 1) {
    buttons.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
      >
        First
      </button>
    );
  }

  buttons.push(
    <button
      key="prev"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
    >
      Previous
    </button>
  );

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }


  for (let i = startPage; i <= endPage; i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 rounded-md ${
          currentPage === i
            ? "bg-blue-700 text-white font-bold"
            : "bg-gray-700 text-white hover:bg-gray-600"
        } transition-colors duration-200`}
      >
        {i}
      </button>
    );
  }

  buttons.push(
    <button
      key="next"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors duration-200"
    >
      Next
    </button>
  );

  if (currentPage < totalPages) {
    buttons.push(
      <button
        key="last"
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
      >
        Last
      </button>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
      {buttons}
    </div>
  );
};

export default PaginationControls;