import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Layout from '../components/Layout.tsx';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  department: {
    _id: string;
    name: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for customer and order
  const dummyCustomer: Customer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    company: 'Acme Corp'
  };

  const dummyOrder: Order = {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'Processing',
    total: 299.99,
    items: [
      { name: 'Product A', quantity: 2, price: 99.99 },
      { name: 'Product B', quantity: 1, price: 100.01 }
    ]
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:6060/api/tickets/assigned', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
        console.error('Error fetching tickets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Ticket List */}
        <div className="w-1/3 pr-4 overflow-y-auto">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Tickets</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading tickets...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4">No tickets assigned to you</div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedTicket?._id === ticket._id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{ticket.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="w-1/3 px-4 overflow-y-auto">
          {selectedTicket ? (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ticket Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="mt-1 text-gray-900">{selectedTicket.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">{selectedTicket.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-gray-900">{selectedTicket.department.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-gray-900">{new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-gray-500 text-center">Select a ticket to view details</p>
            </div>
          )}
        </div>

        {/* Customer & Order Details */}
        <div className="w-1/3 pl-4 overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-4">
              {/* Customer Details */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-gray-900">{dummyCustomer.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-gray-900">{dummyCustomer.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-gray-900">{dummyCustomer.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company</h3>
                    <p className="mt-1 text-gray-900">{dummyCustomer.company}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                    <p className="mt-1 text-gray-900">{dummyOrder.orderNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-gray-900">{dummyOrder.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Items</h3>
                    <div className="mt-2 space-y-2">
                      {dummyOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-900">{item.name} x {item.quantity}</span>
                          <span className="text-gray-500">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${dummyOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-gray-500 text-center">Select a ticket to view customer and order details</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tickets; 