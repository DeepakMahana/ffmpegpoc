const metadata = {
    streams: [
      {
        index: 0,
        codec_name: 'h264',
        codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
        profile: 'Constrained Baseline',
        codec_type: 'video',
        codec_time_base: '1/60',
        codec_tag_string: 'avc1',
        codec_tag: '0x31637661',
        width: 640,
        height: 360,
        coded_width: 640,
        coded_height: 368,
        closed_captions: 0,
        has_b_frames: 0,
        sample_aspect_ratio: '1:1',
        display_aspect_ratio: '16:9',
        pix_fmt: 'yuv420p',
        level: 30,
        color_range: 'tv',
        color_space: 'smpte170m',
        color_transfer: 'bt709',
        color_primaries: 'bt470bg',
        chroma_location: 'left',
        field_order: 'unknown',
        timecode: 'N/A',
        refs: 1,
        is_avc: 'true',
        nal_length_size: 4,
        id: 'N/A',
        r_frame_rate: '30/1',
        avg_frame_rate: '30/1',
        time_base: '1/15360',
        start_pts: 0,
        start_time: 0,
        duration_ts: 350720,
        duration: 22.833333,
        bit_rate: 631387,
        max_bit_rate: 'N/A',
        bits_per_raw_sample: 8,
        nb_frames: 685,
        nb_read_frames: 'N/A',
        nb_read_packets: 'N/A',
        tags: [Object],
        disposition: [Object]
      },
      {
        index: 1,
        codec_name: 'aac',
        codec_long_name: 'AAC (Advanced Audio Coding)',
        profile: 'LC',
        codec_type: 'audio',
        codec_time_base: '1/44100',
        codec_tag_string: 'mp4a',
        codec_tag: '0x6134706d',
        sample_fmt: 'fltp',
        sample_rate: 44100,
        channels: 2,
        channel_layout: 'stereo',
        bits_per_sample: 0,
        id: 'N/A',
        r_frame_rate: '0/0',
        avg_frame_rate: '0/0',
        time_base: '1/44100',
        start_pts: 0,
        start_time: 0,
        duration_ts: 1009664,
        duration: 22.894875,
        bit_rate: 96143,
        max_bit_rate: 'N/A',
        bits_per_raw_sample: 'N/A',
        nb_frames: 986,
        nb_read_frames: 'N/A',
        nb_read_packets: 'N/A',
        tags: [Object],
        disposition: [Object]
      }
    ],
    format: {
      filename: './testvideo.mp4',
      nb_streams: 2,
      nb_programs: 0,
      format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
      format_long_name: 'QuickTime / MOV',
      start_time: 0,
      duration: 22.895,
      size: 2085656,
      bit_rate: 728772,
      probe_score: 100,
      tags: {
        major_brand: 'mp42',
        minor_version: '0',
        compatible_brands: 'isommp42',
        creation_time: '2020-08-09T20:12:31.000000Z'
      }
    },
    chapters: []
  }

const merge = {
  id : "20b30adc-dfdf-4b87-93df-e522386805d0",
  videos: [
    {
      name: '1612261458659-testvideo.mp4',
      operations: [
        {
          name: "TRIM_VIDEO",
          start: 0,
          duration: 5
        }
      ]
    },
    {
      name: '1355-cde.mp4',
      operations: [
        {
          name: "TRIM_VIDEO",
          start: 10,
          duration: 5
        }
      ]
    }
  ]
}