import { Language } from '../types';

export type TranslationKey =
  | 'invoice_editor'
  | 'lease_editor'
  | 'preview'
  | 'download_pdf'
  | 'download_file'
  | 'processing'
  | 'reset'
  | 'ai_import'
  | 'switch_invoice'
  | 'switch_lease'
  | 'switch_chat'
  | 'doc_invoice'
  | 'doc_lease'
  | 'ai_modal_title'
  | 'ai_placeholder'
  | 'ai_error'
  | 'ai_missing_key'
  | 'cancel'
  | 'parse'
  | 'analyzing'
  // Wizard
  | 'step_counter'
  | 'btn_back'
  | 'btn_next'
  // Invoice Form
  | 'step_general'
  | 'step_seller'
  | 'step_buyer'
  | 'step_goods'
  | 'type_person'
  | 'type_company'
  | 'lbl_invoice_no'
  | 'lbl_date'
  | 'lbl_time'
  | 'lbl_vat'
  | 'lbl_name_fio'
  | 'lbl_inn'
  | 'lbl_kpp'
  | 'lbl_address'
  | 'lbl_bank_details'
  | 'lbl_bank_name'
  | 'lbl_bik'
  | 'lbl_corr_account'
  | 'lbl_account_number'
  | 'lbl_signatories'
  | 'lbl_director'
  | 'lbl_accountant'
  | 'lbl_buyer_name'
  | 'lbl_service_list'
  | 'lbl_item_name'
  | 'lbl_qty'
  | 'lbl_price'
  | 'msg_no_items'
  // Lease Form
  | 'step_vehicle'
  | 'step_schedule'
  | 'step_financials'
  | 'step_parties'
  | 'step_signatures'
  | 'lbl_res_id'
  | 'lbl_template_id'
  | 'lbl_optional'
  | 'lbl_source'
  | 'lbl_created'
  | 'grp_vehicle'
  | 'lbl_model'
  | 'lbl_details'
  | 'lbl_plate'
  | 'grp_pickup'
  | 'grp_return'
  | 'lbl_reg_days'
  | 'lbl_reg_price'
  | 'lbl_seas_days'
  | 'lbl_seas_price'
  | 'grp_extra'
  | 'lbl_deposit'
  | 'lbl_total_paid'
  | 'grp_owner'
  | 'lbl_surname'
  | 'lbl_contact'
  | 'grp_renter'
  | 'lbl_passport'
  | 'lbl_terms'
  | 'lbl_fee'
  | 'lbl_sign_owner'
  | 'lbl_sign_renter'
  | 'btn_clear'
  | 'btn_save_sign'
  | 'msg_sign_saved'
  | 'lbl_sign_here'
  // Login
  | 'login_title'
  | 'login_desc'
  | 'lbl_username'
  | 'lbl_password'
  | 'btn_login'
  // Preview
  | 'preview_loading'
  | 'preview_not_found'
  | 'preview_lease_title'
  | 'server_preview'
  | 'generating_blob'
  | 'mobile_editor_tab'
  | 'mobile_preview_tab'
  | 'open_shareable_link'
  // Lease Preview HTML
  | 'lp_lease_agreement'
  | 'lp_reservation_id'
  | 'lp_source'
  | 'lp_created_on'
  | 'lp_pickup'
  | 'lp_default_pickup'
  | 'lp_return'
  | 'lp_default_return'
  | 'lp_rental_cost'
  | 'lp_regular_price'
  | 'lp_season_price'
  | 'lp_days'
  | 'lp_extra_options'
  | 'lp_none'
  | 'lp_deposit'
  | 'lp_return_at_end'
  | 'lp_total_price'
  | 'lp_paid_separately'
  | 'lp_owner'
  | 'lp_lessor'
  | 'lp_date_signature'
  | 'lp_rider'
  | 'lp_tenant'
  | 'lp_passport'
  | 'lp_pickup_fee'
  | 'lp_return_fee'
  // Chat General
  | 'chat_search'
  | 'chat_type_message'
  | 'chat_active'
  | 'chat_view_profile'
  | 'chat_search_history'
  | 'btn_confirm'
  | 'btn_reject'
  | 'btn_collect'
  | 'btn_complete'
  | 'btn_delete'
  | 'btn_archive'
  | 'btn_call'
  | 'btn_download_lease'
  | 'btn_download_invoice'
  // Chat Sidebar
  | 'menu_mark_read'
  | 'menu_mark_unread'
  | 'confirm_delete_chat'
  | 'no_active_chats'
  | 'loading_chats'
  | 'lbl_sort_by'
  | 'sort_date'
  | 'sort_name'
  | 'lbl_filter_status'
  | 'filter_all'
  // Chat Window
  | 'timeline_title'
  | 'no_dates'
  | 'expires_in'
  | 'left_to_action'
  // Chat Layout
  | 'loading_conversation'
  | 'select_conversation'
  | 'select_conversation_desc'
  // Right Panel
  | 'rp_details'
  | 'rp_map'
  | 'rp_profile'
  | 'rp_pickup_location'
  | 'rp_map_placeholder'
  | 'rp_leases'
  | 'rp_status'
  | 'rp_active'
  | 'rp_rider_details'
  | 'rp_full_name'
  | 'rp_enter_name'
  | 'rp_contact_info'
  | 'rp_phone_email'
  | 'rp_passport_id'
  | 'rp_passport_number'
  | 'rp_owner_details'
  | 'rp_rent_service_name'
  | 'rp_shown_on_contract'
  | 'rp_business_address'
  | 'rp_full_address'
  // Statuses
  | 'status_collected'
  | 'status_completed'
  | 'status_overdue'
  | 'status_confirmed'
  | 'status_pending'
  | 'status_wait_owner'
  | 'status_wait_rider'
  | 'status_rejected'
  | 'status_maintenance'
  | 'status_cancelled'
  | 'status_conflict'
  | 'status_no_response'
  // Time
  | 'time_ended'
  | 'time_overdue_by'
  | 'time_ending_now'
  | 'time_ends_in'
  | 'time_days_left';

const dictionary: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    invoice_editor: 'Редактор счета',
    lease_editor: 'Редактор договора',
    preview: 'Предпросмотр',
    download_pdf: 'Скачать PDF',
    download_file: 'Скачать Файл',
    processing: 'Обработка...',
    reset: 'Сброс',
    ai_import: 'AI Импорт',
    switch_invoice: 'Счет (РФ)',
    switch_lease: 'Аренда',
    switch_chat: 'Чат',
    doc_invoice: 'A4 PDF • Стандарт РФ',
    doc_lease: 'A4 PDF • Договор аренды',
    ai_modal_title: 'Импорт данных через AI',
    ai_placeholder: 'Вставьте текст счета или детали аренды...',
    ai_error: 'Не удалось распознать данные.',
    ai_missing_key: 'API ключ не найден.',
    cancel: 'Отмена',
    parse: 'Распознать',
    analyzing: 'Анализ...',
    
    // Wizard
    step_counter: 'Шаг {current} из {total}',
    btn_back: 'Назад',
    btn_next: 'Далее',

    // Invoice Form
    step_general: 'Общая информация',
    step_seller: 'Продавец (Исполнитель)',
    step_buyer: 'Покупатель (Заказчик)',
    step_goods: 'Товары и Услуги',
    type_person: 'Самозанятый / ИП',
    type_company: 'Организация',
    lbl_invoice_no: '№ Счета',
    lbl_date: 'Дата',
    lbl_time: 'Время',
    lbl_vat: 'НДС',
    lbl_name_fio: 'Название / ФИО',
    lbl_inn: 'ИНН',
    lbl_kpp: 'КПП',
    lbl_address: 'Юр. Адрес',
    lbl_bank_details: 'БАНКОВСКИЕ РЕКВИЗИТЫ',
    lbl_bank_name: 'Название Банка',
    lbl_bik: 'БИК',
    lbl_corr_account: 'Корр. счет',
    lbl_account_number: 'Расчетный счет',
    lbl_signatories: 'ПОДПИСАНТЫ',
    lbl_director: 'Руководитель',
    lbl_accountant: 'Бухгалтер',
    lbl_buyer_name: 'Название компании',
    lbl_service_list: 'Список услуг',
    lbl_item_name: 'Наименование',
    lbl_qty: 'Кол-во',
    lbl_price: 'Цена (руб)',
    msg_no_items: 'Нет товаров',

    // Lease Form
    step_vehicle: 'Авто и Инфо',
    step_schedule: 'Расписание',
    step_financials: 'Финансы',
    step_parties: 'Стороны и Условия',
    step_signatures: 'Подписи',
    lbl_res_id: 'ID Брони',
    lbl_template_id: 'ID Шаблона',
    lbl_optional: 'Опционально',
    lbl_source: 'Источник',
    lbl_created: 'Создано',
    grp_vehicle: 'ДЕТАЛИ ТС',
    lbl_model: 'Модель',
    lbl_details: 'Детали (Тип, Цвет)',
    lbl_plate: 'Госномер',
    grp_pickup: 'ВЫДАЧА (СТАРТ)',
    grp_return: 'ВОЗВРАТ (КОНЕЦ)',
    lbl_reg_days: 'Дни (Обыч)',
    lbl_reg_price: 'Цена (Обыч)',
    lbl_seas_days: 'Дни (Сезон)',
    lbl_seas_price: 'Цена (Сезон)',
    grp_extra: 'ДОП. ОПЦИИ',
    lbl_deposit: 'Депозит',
    lbl_total_paid: 'ИТОГО ОПЛАЧЕНО',
    grp_owner: 'ВЛАДЕЛЕЦ (АРЕНДОДАТЕЛЬ)',
    lbl_surname: 'Фамилия / Название',
    lbl_contact: 'Контакты',
    grp_renter: 'РАЙДЕР (АРЕНДАТОР)',
    lbl_passport: 'Паспорт',
    lbl_terms: 'Юридические условия',
    lbl_fee: 'Сбор (Fee)',
    lbl_sign_owner: 'Подпись Владельца',
    lbl_sign_renter: 'Подпись Райдера',
    btn_clear: 'Очистить',
    btn_save_sign: 'Сохранить подпись',
    msg_sign_saved: 'Подпись сохранена',
    lbl_sign_here: 'Подпишите здесь',

    // Login
    login_title: 'Ограниченный доступ',
    login_desc: 'Пожалуйста, войдите для просмотра документа.',
    lbl_username: 'Имя пользователя / Email',
    lbl_password: 'Пароль',
    btn_login: 'Войти',

    // Preview
    preview_loading: 'Загрузка документа...',
    preview_not_found: 'Документ не найден',
    preview_lease_title: 'Договор Аренды',
    server_preview: 'Предпросмотр (Сервер)',
    generating_blob: 'Генерация PDF...',
    mobile_editor_tab: 'Редактор',
    mobile_preview_tab: 'Просмотр',
    open_shareable_link: 'Открыть ссылку',

    // Lease Preview HTML
    lp_lease_agreement: 'Договор аренды',
    lp_reservation_id: 'ID Бронирования',
    lp_source: 'Источник',
    lp_created_on: 'Создано',
    lp_pickup: 'Выдача',
    lp_default_pickup: 'Стандартная выдача',
    lp_return: 'Возврат',
    lp_default_return: 'Стандартный возврат',
    lp_rental_cost: 'Стоимость Аренды',
    lp_regular_price: 'Обычная цена',
    lp_season_price: 'Сезонная цена',
    lp_days: 'дн.',
    lp_extra_options: 'Доп. опции',
    lp_none: 'Нет',
    lp_deposit: 'Депозит',
    lp_return_at_end: 'Возврат в конце аренды',
    lp_total_price: 'Итоговая цена',
    lp_paid_separately: 'Оплачивается отдельно',
    lp_owner: 'Владелец',
    lp_lessor: 'Арендодатель',
    lp_date_signature: 'Дата, подпись',
    lp_rider: 'Райдер',
    lp_tenant: 'Арендатор',
    lp_passport: 'Паспорт',
    lp_pickup_fee: 'Сбор за выдачу',
    lp_return_fee: 'Сбор за возврат',
    
    // Chat General
    chat_search: 'Поиск чатов',
    chat_type_message: 'Введите сообщение...',
    chat_active: 'Активен',
    chat_view_profile: 'Профиль',
    chat_search_history: 'Поиск в истории',
    btn_confirm: 'Подтвердить',
    btn_reject: 'Отклонить',
    btn_collect: 'Выдать',
    btn_complete: 'Завершить',
    btn_delete: 'Удалить',
    btn_archive: 'Архив',
    btn_call: 'Позвонить',
    btn_download_lease: 'Скачать договор',
    btn_download_invoice: 'Скачать счет',

    // Chat Sidebar
    menu_mark_read: 'Прочитано',
    menu_mark_unread: 'Непрочитано',
    confirm_delete_chat: 'Вы уверены, что хотите удалить этот чат? Это действие необратимо.',
    no_active_chats: 'Нет активных чатов.',
    loading_chats: 'Загрузка чатов...',
    lbl_sort_by: 'Сортировка',
    sort_date: 'Дата',
    sort_name: 'Имя',
    lbl_filter_status: 'Статус',
    filter_all: 'Все',

    // Chat Window
    timeline_title: 'Таймлайн',
    no_dates: 'Даты не выбраны',
    expires_in: 'Истекает через',
    left_to_action: 'на решение',

    // Chat Layout
    loading_conversation: 'Загрузка переписки...',
    select_conversation: 'Выберите чат',
    select_conversation_desc: 'Выберите чат из списка, чтобы увидеть детали, управлять договорами и общаться с арендаторами.',

    // Right Panel
    rp_details: 'Детали',
    rp_map: 'Карта',
    rp_profile: 'Профиль',
    rp_pickup_location: 'Место подачи',
    rp_map_placeholder: 'Карта',
    rp_leases: 'Аренды',
    rp_status: 'Статус',
    rp_active: 'Активен',
    rp_rider_details: 'Данные Райдера',
    rp_full_name: 'ФИО',
    rp_enter_name: 'Введите имя',
    rp_contact_info: 'Контакты',
    rp_phone_email: 'Телефон или Email',
    rp_passport_id: 'Паспорт / ID',
    rp_passport_number: 'Номер паспорта',
    rp_owner_details: 'Данные Владельца',
    rp_rent_service_name: 'Название проката',
    rp_shown_on_contract: 'Для договора',
    rp_business_address: 'Адрес офиса',
    rp_full_address: 'Полный адрес',

    // Statuses
    status_collected: 'Выдано',
    status_completed: 'Завершено',
    status_overdue: 'Просрочено',
    status_confirmed: 'Подтверждено',
    status_pending: 'Ожидание',
    status_wait_owner: 'Ждет Владельца',
    status_wait_rider: 'Ждет Райдера',
    status_rejected: 'Отклонено',
    status_maintenance: 'Обслуживание',
    status_cancelled: 'Отменено',
    status_conflict: 'Конфликт',
    status_no_response: 'Нет ответа',

    // Time
    time_ended: 'Завершено',
    time_overdue_by: 'Просрочка',
    time_ending_now: 'Завершается сейчас',
    time_ends_in: 'До конца',
    time_days_left: 'дн. осталось'
  },
  en: {
    invoice_editor: 'Invoice Editor',
    lease_editor: 'Lease Editor',
    preview: 'Preview',
    download_pdf: 'Download PDF',
    download_file: 'Download File',
    processing: 'Processing...',
    reset: 'Reset',
    ai_import: 'AI Import',
    switch_invoice: 'Invoice (RU)',
    switch_lease: 'Lease',
    switch_chat: 'Chat',
    doc_invoice: 'A4 PDF • Russian Standard',
    doc_lease: 'A4 PDF • Rental Agreement',
    ai_modal_title: 'AI Data Import',
    ai_placeholder: 'Paste invoice text or lease details here...',
    ai_error: 'Could not parse data.',
    ai_missing_key: 'API Key is missing.',
    cancel: 'Cancel',
    parse: 'Parse',
    analyzing: 'Analyzing...',

    // Wizard
    step_counter: 'Step {current} of {total}',
    btn_back: 'Back',
    btn_next: 'Next',

    // Invoice Form
    step_general: 'General Info',
    step_seller: 'Seller (Provider)',
    step_buyer: 'Buyer (Customer)',
    step_goods: 'Items & Services',
    type_person: 'Self-Employed / IP',
    type_company: 'Company',
    lbl_invoice_no: 'Invoice #',
    lbl_date: 'Date',
    lbl_time: 'Time',
    lbl_vat: 'VAT',
    lbl_name_fio: 'Name / Full Name',
    lbl_inn: 'INN (Tax ID)',
    lbl_kpp: 'KPP',
    lbl_address: 'Legal Address',
    lbl_bank_details: 'BANK DETAILS',
    lbl_bank_name: 'Bank Name',
    lbl_bik: 'BIC',
    lbl_corr_account: 'Corr. Account',
    lbl_account_number: 'Account Number',
    lbl_signatories: 'SIGNATORIES',
    lbl_director: 'Director',
    lbl_accountant: 'Accountant',
    lbl_buyer_name: 'Company Name',
    lbl_service_list: 'List of Services',
    lbl_item_name: 'Name',
    lbl_qty: 'Qty',
    lbl_price: 'Price (RUB)',
    msg_no_items: 'No items',

    // Lease Form
    step_vehicle: 'Vehicle & Info',
    step_schedule: 'Schedule',
    step_financials: 'Financials',
    step_parties: 'Parties & Terms',
    step_signatures: 'Signatures',
    lbl_res_id: 'Res ID',
    lbl_template_id: 'Template ID',
    lbl_optional: 'Optional',
    lbl_source: 'Source',
    lbl_created: 'Created On',
    grp_vehicle: 'VEHICLE DETAILS',
    lbl_model: 'Model Name',
    lbl_details: 'Details (Type, Color)',
    lbl_plate: 'Plate Number',
    grp_pickup: 'PICK-UP (START)',
    grp_return: 'RETURN (END)',
    lbl_reg_days: 'Regular Days',
    lbl_reg_price: 'Regular Price',
    lbl_seas_days: 'Season Days',
    lbl_seas_price: 'Season Price',
    grp_extra: 'EXTRA OPTIONS',
    lbl_deposit: 'Deposit Amount',
    lbl_total_paid: 'TOTAL PAID',
    grp_owner: 'OWNER (LESSOR)',
    lbl_surname: 'Surname / Name',
    lbl_contact: 'Contact',
    grp_renter: 'RIDER (TENANT)',
    lbl_passport: 'Passport No',
    lbl_terms: 'Legal Terms',
    lbl_fee: 'Extra Fee',
    lbl_sign_owner: 'Owner Signature',
    lbl_sign_renter: 'Rider Signature',
    btn_clear: 'Clear',
    btn_save_sign: 'Save Signature',
    msg_sign_saved: 'Signature Saved',
    lbl_sign_here: 'Sign Here',

    // Login
    login_title: 'Restricted Access',
    login_desc: 'Please log in to view this document.',
    lbl_username: 'Username / Email',
    lbl_password: 'Password',
    btn_login: 'Log In',

    // Preview
    preview_loading: 'Loading Document...',
    preview_not_found: 'Document not found',
    preview_lease_title: 'Lease Agreement Preview',
    server_preview: 'Server Preview',
    generating_blob: 'Generating PDF...',
    mobile_editor_tab: 'Editor',
    mobile_preview_tab: 'Preview',
    open_shareable_link: 'Open Shareable Link',

    // Lease Preview HTML
    lp_lease_agreement: 'Lease agreement',
    lp_reservation_id: 'Reservation ID',
    lp_source: 'Source',
    lp_created_on: 'Created on',
    lp_pickup: 'Pick-up',
    lp_default_pickup: 'Default pick-up',
    lp_return: 'Return',
    lp_default_return: 'Default return',
    lp_rental_cost: 'Rental Cost',
    lp_regular_price: 'Regular price',
    lp_season_price: 'Season price',
    lp_days: 'days',
    lp_extra_options: 'Extra options',
    lp_none: 'None',
    lp_deposit: 'Deposit',
    lp_return_at_end: 'Return at the end of the rental period',
    lp_total_price: 'Total price',
    lp_paid_separately: 'Paid separately',
    lp_owner: 'Owner',
    lp_lessor: 'Lessor',
    lp_date_signature: 'Date, signature',
    lp_rider: 'Rider',
    lp_tenant: 'Tenant',
    lp_passport: 'Passport',
    lp_pickup_fee: 'Pick-up fee',
    lp_return_fee: 'Return fee',

    // Chat General
    chat_search: 'Search chats',
    chat_type_message: 'Type a message...',
    chat_active: 'Active now',
    chat_view_profile: 'View profile',
    chat_search_history: 'Search history',
    btn_confirm: 'Confirm',
    btn_reject: 'Reject',
    btn_collect: 'Collect',
    btn_complete: 'Complete',
    btn_delete: 'Delete',
    btn_archive: 'Archive',
    btn_call: 'Call',
    btn_download_lease: 'Download Lease',
    btn_download_invoice: 'Download Invoice',

    // Chat Sidebar
    menu_mark_read: 'Mark as Read',
    menu_mark_unread: 'Mark as Unread',
    confirm_delete_chat: 'Are you sure you want to delete this conversation? This cannot be undone.',
    no_active_chats: 'No active chats found.',
    loading_chats: 'Loading chats...',
    lbl_sort_by: 'Sort by',
    sort_date: 'Date',
    sort_name: 'Name',
    lbl_filter_status: 'Status',
    filter_all: 'All',

    // Chat Window
    timeline_title: 'Timeline',
    no_dates: 'No dates set',
    expires_in: 'Expires in',
    left_to_action: 'left to action',

    // Chat Layout
    loading_conversation: 'Loading conversation...',
    select_conversation: 'Select a Conversation',
    select_conversation_desc: 'Choose a chat from the sidebar to view details, manage lease agreements, and communicate with renters.',

    // Right Panel
    rp_details: 'Details',
    rp_map: 'Map',
    rp_profile: 'Profile',
    rp_pickup_location: 'Pickup Location',
    rp_map_placeholder: 'Map Placeholder',
    rp_leases: 'Leases',
    rp_status: 'Status',
    rp_active: 'Active',
    rp_rider_details: 'Rider Details',
    rp_full_name: 'Full Name',
    rp_enter_name: 'Enter Name',
    rp_contact_info: 'Contact Info',
    rp_phone_email: 'Phone or Email',
    rp_passport_id: 'Passport / ID',
    rp_passport_number: 'Passport Number',
    rp_owner_details: 'Owner Details',
    rp_rent_service_name: 'Rent Service Name',
    rp_shown_on_contract: 'Shown on contract',
    rp_business_address: 'Business Address',
    rp_full_address: 'Full Address',

    // Statuses
    status_collected: 'Collected',
    status_completed: 'Completed',
    status_overdue: 'Overdue',
    status_confirmed: 'Confirmed',
    status_pending: 'Pending',
    status_wait_owner: 'Wait Owner',
    status_wait_rider: 'Wait Rider',
    status_rejected: 'Rejected',
    status_maintenance: 'Maintenance',
    status_cancelled: 'Cancelled',
    status_conflict: 'Conflict',
    status_no_response: 'No Response',

    // Time
    time_ended: 'Ended',
    time_overdue_by: 'Overdue by',
    time_ending_now: 'Ending now',
    time_ends_in: 'Ends in',
    time_days_left: 'days left'
  },
  // Add other languages (th, vi, id) if necessary, using 'en' as fallback for now
  th: {} as any,
  vi: {} as any,
  id: {} as any,
};

// Fallback for missing languages
dictionary.th = dictionary.en;
dictionary.vi = dictionary.en;
dictionary.id = dictionary.en;

export const t = (key: TranslationKey, lang: Language): string => {
  return dictionary[lang][key] || dictionary['en'][key] || key;
};