"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
}

export function PaginationControls({ currentPage, totalPages, total, limit }: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const navigateToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7; // Show max 7 page buttons

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        // Show pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            {/* Mobile View */}
            <div className="flex justify-between sm:hidden w-full">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startItem}</span> to{' '}
                        <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* First Page */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-md"
                            onClick={() => navigateToPage(1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Previous Page */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigateToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page, index) =>
                            typeof page === 'number' ? (
                                <Button
                                    key={index}
                                    variant={page === currentPage ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => navigateToPage(page)}
                                    className={page === currentPage ? 'z-10' : ''}
                                >
                                    {page}
                                </Button>
                            ) : (
                                <span key={index} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
                                    {page}
                                </span>
                            )
                        )}

                        {/* Next Page */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigateToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last Page */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-r-md"
                            onClick={() => navigateToPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
