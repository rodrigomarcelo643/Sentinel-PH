import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, MapPin, Users, Building2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { regions } from '@/data/regions';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '@/components/ui/TableSkeleton';

export default function Regions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const PhilippineFlag = () => (
    <svg width="32" height="24" viewBox="0 0 32 24" className="rounded shadow-sm">
      <rect width="32" height="12" fill="#0038A8" />
      <rect y="12" width="32" height="12" fill="#CE1126" />
      <polygon points="0,0 12,12 0,24" fill="white" />
      <g transform="translate(4, 12)">
        <circle r="2.5" fill="#FCD116" />
        <path d="M 0,-2.5 L 0.5,-0.8 L 2.4,-0.8 L 0.9,0.4 L 1.5,2.1 L 0,0.9 L -1.5,2.1 L -0.9,0.4 L -2.4,-0.8 L -0.5,-0.8 Z" fill="#FCD116" />
      </g>
      <g transform="translate(2, 6)">
        <circle r="1" fill="#FCD116" />
      </g>
      <g transform="translate(6, 6)">
        <circle r="1" fill="#FCD116" />
      </g>
      <g transform="translate(2, 18)">
        <circle r="1" fill="#FCD116" />
      </g>
      <g transform="translate(6, 18)">
        <circle r="1" fill="#FCD116" />
      </g>
    </svg>
  );

  const filteredRegions = useMemo(() => {
    return regions.filter(region => 
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegions = filteredRegions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-[#1B365D] mb-2">Philippine Regions</h1>
        <p className="text-gray-600">Overview of all regions in the Philippines</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <PhilippineFlag />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Regions</h2>
              <p className="text-sm text-gray-500">{filteredRegions.length} regions found</p>
            </div>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search regions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton rows={10} columns={5} />
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Municipalities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRegions.map((region, index) => (
                <motion.tr
                  key={region.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/municipalities?region=${region.name}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PhilippineFlag />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${region.color} text-white`}>
                      {region.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{region.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{region.municipalities}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{region.population}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {filteredRegions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No regions found matching your search.
          </div>
        )}

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRegions.length)} of {filteredRegions.length} regions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(number)}
                className={currentPage === number ? "bg-[#1B365D] hover:bg-[#1B365D]/90" : ""}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
