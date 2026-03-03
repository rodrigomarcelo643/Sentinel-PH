import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemType: string;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, itemType }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (totalItems === 0) return null;

  return (
    <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} {itemType}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(number)}
            className={`cursor-pointer ${currentPage === number ? "bg-[#1B365D] hover:bg-[#1B365D]/90" : ""}`}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="cursor-pointer"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}