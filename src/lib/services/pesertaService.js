import { supabase } from '$lib/server/supabase.js';

export class PesertaService {
	/**
	 * Ambil semua data peserta dengan maklumat pelanggan
	 */
	static async getAllPesertaWithMaklumat() {
		const { data, error } = await supabase
			.from('booking_with_members')
			.select('*')
			.order('booking_created_at', { ascending: false });

		if (error) {
			console.error('Error fetching booking with members:', error);
			throw error;
		}

		return data;
	}

	/**
	 * Ambil data peserta berdasarkan ID booking
	 */
	static async getPesertaByBookingId(bookingId) {
		const { data, error } = await supabase
			.from('members_booking')
			.select('*')
			.eq('booking_id', bookingId)
			.order('created_at', { ascending: true });

		if (error) {
			console.error('Error fetching members by booking ID:', error);
			throw error;
		}

		return data;
	}

	/**
	 * Ambil data booking dengan peserta
	 */
	static async getBookingWithMembers(bookingId) {
		// Ambil booking
		const { data: booking, error: bookingError } = await supabase
			.from('bookings')
			.select('*')
			.eq('id', bookingId)
			.single();

		if (bookingError) {
			console.error('Error fetching booking:', bookingError);
			throw bookingError;
		}

		// Ambil data peserta
		const members = await this.getPesertaByBookingId(bookingId);

		return {
			booking,
			members
		};
	}

	/**
	 * Tambah peserta baru
	 */
	static async addPeserta(pesertaData) {
		const { data, error } = await supabase
			.from('members_booking')
			.insert([pesertaData])
			.select();

		if (error) {
			console.error('Error adding member:', error);
			throw error;
		}

		return data[0];
	}

	/**
	 * Update data peserta
	 */
	static async updatePeserta(pesertaId, updateData) {
		const { data, error } = await supabase
			.from('members_booking')
			.update(updateData)
			.eq('id', pesertaId)
			.select();

		if (error) {
			console.error('Error updating member:', error);
			throw error;
		}

		return data[0];
	}

	/**
	 * Hapus peserta
	 */
	static async deletePeserta(pesertaId) {
		const { error } = await supabase
			.from('members_booking')
			.delete()
			.eq('id', pesertaId);

		if (error) {
			console.error('Error deleting member:', error);
			throw error;
		}

		return true;
	}

	/**
	 * Hitung jumlah peserta berdasarkan booking ID
	 */
	static async countPesertaByBookingId(bookingId) {
		const { count, error } = await supabase
			.from('members_booking')
			.select('*', { count: 'exact', head: true })
			.eq('booking_id', bookingId);

		if (error) {
			console.error('Error counting members:', error);
			throw error;
		}

		return count;
	}
}
